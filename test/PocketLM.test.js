const { expect } = require("chai");
const { ethers } = require("hardhat");

const HASH = ethers.keccak256(ethers.toUtf8Bytes("some document"));

describe("PocketLM", () => {
  let lm, alice, bob;
  beforeEach(async () => {
    [alice, bob] = await ethers.getSigners();
    lm = await (await ethers.getContractFactory("PocketLM")).deploy();
  });

  it("starts empty with ids from 1", async () => {
    expect(await lm.totalStudies()).to.equal(0);
    await expect(lm.getStudy(1)).to.be.revertedWithCustomError(lm, "StudyNotFound");
    await expect(lm.getStudy(0)).to.be.revertedWithCustomError(lm, "StudyNotFound");
  });

  it("stamps a study, stores fields and emits the event", async () => {
    await expect(lm.connect(alice).stampStudy("Biology ch.3", HASH, 4, 5))
      .to.emit(lm, "StudyStamped")
      .withArgs(1, alice.address, HASH, 4);
    const s = await lm.getStudy(1);
    expect(s.learner).to.equal(alice.address);
    expect(s.title).to.equal("Biology ch.3");
    expect(s.docHash).to.equal(HASH);
    expect(s.score).to.equal(4);
    expect(s.total).to.equal(5);
    expect(s[5]).to.be.greaterThan(0); // ethers Result has a built-in .at(), so read the field by index
    expect(await lm.totalStudies()).to.equal(1);
  });

  it("returns the id from stampStudy", async () => {
    expect(await lm.connect(alice).stampStudy.staticCall("A", HASH, 1, 5)).to.equal(1);
  });

  it("tracks studies per learner", async () => {
    await lm.connect(alice).stampStudy("A", HASH, 5, 5);
    await lm.connect(bob).stampStudy("B", HASH, 2, 5);
    await lm.connect(alice).stampStudy("C", HASH, 3, 5);
    expect((await lm.studiesOf(alice.address)).map(Number)).to.deep.equal([1, 3]);
    expect((await lm.studiesOf(bob.address)).map(Number)).to.deep.equal([2]);
    expect(await lm.studiesOf(ethers.Wallet.createRandom().address)).to.deep.equal([]);
  });

  it("accepts 0 score and full score", async () => {
    await lm.stampStudy("Zero", HASH, 0, 5);
    await lm.stampStudy("Full", HASH, 5, 5);
  });

  it("rejects score above total", async () => {
    await expect(lm.stampStudy("A", HASH, 6, 5)).to.be.revertedWithCustomError(lm, "InvalidScore");
  });

  it("rejects total of zero", async () => {
    await expect(lm.stampStudy("A", HASH, 0, 0)).to.be.revertedWithCustomError(lm, "InvalidScore");
  });

  it("rejects empty title and too-long title, accepts the cap", async () => {
    await expect(lm.stampStudy("", HASH, 1, 5)).to.be.revertedWithCustomError(lm, "EmptyTitle");
    await expect(lm.stampStudy("x".repeat(81), HASH, 1, 5)).to.be.revertedWithCustomError(lm, "TitleTooLong");
    await lm.stampStudy("x".repeat(80), HASH, 1, 5);
  });

  it("counts title length in bytes (multi-byte characters)", async () => {
    await expect(lm.stampStudy("é".repeat(41), HASH, 1, 5)).to.be.revertedWithCustomError(lm, "TitleTooLong");
  });

  it("rejects an empty hash", async () => {
    await expect(lm.stampStudy("A", ethers.ZeroHash, 1, 5)).to.be.revertedWithCustomError(lm, "EmptyHash");
  });

  it("exposes the public studies array", async () => {
    await lm.stampStudy("A", HASH, 1, 5);
    expect((await lm.studies(1)).title).to.equal("A");
  });
});
