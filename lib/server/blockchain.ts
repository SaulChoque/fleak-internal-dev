import { encodeFunctionData } from "viem";

const DEPOSIT_FUNCTION = "deposit";

const FLEAK_ABI = [
  {
    name: DEPOSIT_FUNCTION,
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "flakeId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "resolveFlake",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "flakeId", type: "uint256" },
      { name: "winner", type: "address" },
    ],
    outputs: [],
  },
] as const;

export function buildDepositCalldata(flakeNumericId: bigint) {
  return encodeFunctionData({
    abi: FLEAK_ABI,
    functionName: DEPOSIT_FUNCTION,
    args: [flakeNumericId],
  });
}

export function buildResolveCalldata(flakeNumericId: bigint, winnerAddress: `0x${string}`) {
  return encodeFunctionData({
    abi: FLEAK_ABI,
    functionName: "resolveFlake",
    args: [flakeNumericId, winnerAddress],
  });
}
