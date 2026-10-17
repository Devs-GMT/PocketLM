import { BrowserProvider, Contract, JsonRpcProvider, Network } from "ethers";
import { NETWORK, CONTRACT_ADDRESS } from "@/lib/config";

export const ABI = [
  "function stampStudy(string title, bytes32 docHash, uint8 score, uint8 total) returns (uint256 id)",
  "function getStudy(uint256 id) view returns (tuple(address learner, string title, bytes32 docHash, uint8 score, uint8 total, uint64 at))",
  "function studiesOf(address learner) view returns (uint256[])",
  "function totalStudies() view returns (uint256)",
  "event StudyStamped(uint256 indexed id, address indexed learner, bytes32 docHash, uint8 score)",
];

export const MAX_TITLE_BYTES = 80;

let _read;
function readContract() {
  if (!CONTRACT_ADDRESS) throw new Error("The contract address is not set for this network yet.");
  if (!_read) {
    const net = Network.from(NETWORK.chainId);
    const provider = new JsonRpcProvider(NETWORK.rpcUrl, net, { staticNetwork: net });
    _read = new Contract(CONTRACT_ADDRESS, ABI, provider);
  }
  return _read;
}

// The public RPC occasionally drops a connection, so reads are retried.
async function retry(fn, tries = 4) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw last;
}

// Read struct fields by index: an ethers Result already has a method called `at`.
function toStudy(id, r) {
  return {
    id: Number(id),
    learner: r[0],
    title: r[1],
    docHash: r[2],
    score: Number(r[3]),
    total: Number(r[4]),
    at: Number(r[5]),
  };
}

/** Returns the study, or null when the id does not exist. */
export async function fetchStudy(id) {
  const c = readContract();
  try {
    return toStudy(id, await retry(() => c.getStudy(id), 3));
  } catch (e) {
    if (e?.revert?.name === "StudyNotFound" || /StudyNotFound/.test(e?.message || "")) return null;
    // A call that reverts without a decoded reason also means "no such study".
    if (e?.code === "CALL_EXCEPTION") return null;
    throw e;
  }
}

export async function fetchStudiesOf(address) {
  const c = readContract();
  const ids = await retry(() => c.studiesOf(address));
  const studies = await Promise.all(ids.map((id) => retry(() => c.getStudy(id)).then((r) => toStudy(id, r))));
  return studies.sort((a, b) => b.id - a.id);
}

/** Sends the stamp transaction through the user's wallet. Calls the callbacks as it progresses. */
export async function stampStudy(ethereum, { title, docHash, score, total }, { onSent } = {}) {
  if (!CONTRACT_ADDRESS) throw new Error("The contract address is not set for this network yet.");
  const provider = new BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);
  const tx = await contract.stampStudy(title, docHash, score, total);
  onSent?.(tx.hash);
  const receipt = await tx.wait();
  if (!receipt || receipt.status !== 1) throw new Error("The transaction failed on chain.");
  let id = null;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === "StudyStamped") id = Number(parsed.args[0]);
    } catch {
      /* not our event */
    }
  }
  return { id, txHash: tx.hash };
}

export function isUserRejection(e) {
  return e?.code === 4001 || e?.code === "ACTION_REJECTED" || e?.info?.error?.code === 4001;
}
