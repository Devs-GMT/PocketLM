# PocketLM

An easy NotebookLM: paste text or a short PDF and AI gives a summary, key points, a quiz and answers to your questions. Finishing the quiz stamps a study record on BOT Chain.

## How it works

1. Paste text or upload a PDF (up to 10 pages / ~20,000 characters). PDF text is read in your browser with pdf.js.
2. The text goes to our own API route (`/api/study`), which asks Groq for a summary, 5 key points and a 5-question quiz. `/api/ask` answers questions only from your document and quotes the line it used.
3. Listen uses the browser's built-in voice. Nothing extra is sent anywhere.
4. The quiz is graded in your browser. Finish it and stamp `title + SHA-256 of the text + score` on BOT Chain.
5. `My shelf` and `/app?study=ID` read the proof straight from the contract. No database, no accounts.

**Only the title, the document hash and the score are on-chain. The document text never is.**

## Contract

`contracts/src/PocketLM.sol` (Solidity 0.8.24, no tokens, no payments, no admin).

| Network | Chain ID | Address |
|---|---|---|
| BOT Chain Testnet | 968 | `0x9e7ad905539f72c3Ae7B8f8637c19EEFBa8B61aA` ([scan.bohr.life](https://scan.bohr.life/address/0x9e7ad905539f72c3Ae7B8f8637c19EEFBa8B61aA)) |
| BOT Chain Mainnet | 677 | _not deployed yet_ |

Study ids start at 1. Titles are limited to 80 bytes. `score <= total` and `total > 0` are enforced.

## Project layout

```
PocketLM/
  contracts/   Hardhat project: src/PocketLM.sol, test/, scripts/deploy.js, deployments/
  web/         Next.js app: pages and UI (app/, components/), browser logic and the
               Groq proxy (app/api/*, lib/), deployed to Vercel
```

## Run it locally

```bash
npm run install:all                               # installs web/ and contracts/
cp contracts/.env.example contracts/.env          # deployer key, testnet only
cp web/.env.local.example web/.env.local          # GROQ_API_KEY
npm run dev                                       # web app on http://localhost:3000
npm run test:contract                             # contract tests
npm run deploy:testnet                            # deploys to BOT Chain testnet, writes contracts/deployments/botTestnet.json
```

Secrets live only in `contracts/.env` and `web/.env.local` (both git-ignored). On Vercel, set the project's **Root Directory** to `web` and add `GROQ_API_KEY` (and optionally `GROQ_MODEL`) as Environment Variables. The deployer key is never needed there.

## Mainnet checklist (done by the owner, in Remix)

1. Open `contracts/src/PocketLM.sol` in Remix. Compiler `0.8.24`, EVM version `paris`, optimizer on (200 runs). No constructor arguments.
2. Deploy with the mainnet wallet on BOT Chain (chain ID 677).
3. In Vercel set `NEXT_PUBLIC_NETWORK=mainnet`, `NEXT_PUBLIC_CONTRACT_MAINNET=<address>` and, if the default is wrong, `NEXT_PUBLIC_MAINNET_RPC=<rpc url>`. Redeploy.
4. Replace `web/public/botchain-logo.svg` with the official BOT Chain logo (same file name).

## Limits, said plainly

- **The score is self-reported.** The quiz is graded in the browser, so anyone can stamp any score. A stamp shows that a wallet logged a result at a given time, not that the person mastered the material.
- The rate limit is a simple per-IP counter in server memory. Fine for a demo; move it to Redis if traffic grows.

## Siapa yang menggunakan PocketLM?

### Pengguna utama

1. **Mahasiswa dan pelajar** (pengguna utama): mengunggah materi kuliah, memahami isinya lewat AI, mengerjakan kuis, dan mencatat progres belajar. Manfaat: belajar lebih cepat dan punya riwayat aktivitas belajar.
2. **Dosen atau mentor** (pihak yang memverifikasi): bisa memeriksa study record mahasiswa lewat blockchain explorer, misalnya untuk melihat bahwa mahasiswa mencatat hasil kuis tertentu pada waktu tertentu. Manfaat: memeriksa catatan tanpa bergantung sepenuhnya pada database PocketLM.
3. **Komunitas belajar atau penyelenggara program** (pihak yang menerima bukti): program belajar mandiri, komunitas bootcamp, atau penyelenggara challenge belajar yang ingin peserta mencatat progresnya secara transparan. Manfaat: catatan aktivitas belajar yang bisa diperiksa secara independen.

### Target pengguna tambahan

4. **Profesional yang melakukan upskilling**: karyawan yang mempelajari skill baru (AI, programming, cybersecurity, data analytics). Manfaat: mencatat aktivitas belajar mandiri sebagai pelengkap portofolio.
5. **Kreator kursus dan instruktur online**: memakai PocketLM sebagai alat bantu belajar untuk materi yang mereka buat. Integrasi langsung dengan kursus masih perlu dikembangkan.
6. **Perekrut dan tim HR**: bisa memeriksa riwayat belajar kandidat sebagai informasi tambahan tentang inisiatif pengembangan diri. Catatan PocketLM bukan bukti kompetensi atau penguasaan skill.
7. **Bootcamp dan penyelenggara pelatihan**: mengarahkan peserta mempelajari materi dan mencatat hasil kuis selama program. Verifikasi hasil yang jujur membutuhkan mekanisme tambahan.
8. **Developer dan komunitas Web3**: mempelajari dokumentasi blockchain, smart contract, protokol, atau SDK, lalu membagikan study record ke komunitas atau mentor.
9. **Perusahaan dan tim Learning & Development**: membantu karyawan memahami SOP, dokumentasi internal, atau materi pelatihan. Untuk dokumen rahasia dibutuhkan kontrol privasi dan akses tambahan.

## Roadmap

| Versi | Fitur dokumen |
|---|---|
| **MVP (V1)** | 1 dokumen per notebook, PDF atau paste teks |
| V1.1 | Bisa menambahkan beberapa dokumen ke notebook yang sama |
| V1.2 | AI menjawab pertanyaan berdasarkan seluruh dokumen |
| V2 | Ringkasan gabungan, kuis lintas dokumen, dan sitasi sumber dokumen |

Hanya MVP (V1) yang dikerjakan sekarang. Versi lain adalah rencana ke depan.

## Catatan penting

- Hanya **hash dokumen dan judul** yang masuk on-chain. Teks dokumen tidak pernah disimpan.
- Skor kuis dinilai di browser dan dicatat oleh pengguna sendiri (**self-reported**). Study record membuktikan bahwa sebuah wallet mencatat hasil pada waktu tertentu, bukan bahwa orang itu menguasai materinya.
