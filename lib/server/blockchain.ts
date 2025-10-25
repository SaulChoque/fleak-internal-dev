import {
  encodeFunctionData,
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type Hash,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";

const FLEAK_ABI = [
  {
    name: "createFlake",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "flakeId", type: "uint256" },
      { name: "expectedParticipants", type: "address[]" },
      { name: "feeBps", type: "uint16" },
      { name: "feeRecipient", type: "address" },
      { name: "initialStakeRecipient", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "stake",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "flakeId", type: "uint256" },
      { name: "beneficiary", type: "address" },
    ],
    outputs: [{ name: "newStake", type: "uint256" }],
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
  {
    name: "openRefunds",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "flakeId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "withdrawRefund",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "flakeId", type: "uint256" }],
    outputs: [{ name: "amount", type: "uint256" }],
  },
  {
    name: "getFlake",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "flakeId", type: "uint256" }],
    outputs: [
      {
        name: "viewData",
        type: "tuple",
        components: [
          { name: "creator", type: "address" },
          { name: "state", type: "uint8" },
          { name: "winner", type: "address" },
          { name: "feeBps", type: "uint16" },
          { name: "feeRecipient", type: "address" },
          { name: "lifetimeStake", type: "uint256" },
          { name: "currentStake", type: "uint256" },
          { name: "distributedPayout", type: "uint256" },
          { name: "distributedFee", type: "uint256" },
          { name: "refundedAmount", type: "uint256" },
          { name: "createdAt", type: "uint40" },
          { name: "resolvedAt", type: "uint40" },
          { name: "cancelledAt", type: "uint40" },
        ],
      },
    ],
  },
  {
    name: "getParticipants",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "flakeId", type: "uint256" }],
    outputs: [
      { name: "participants", type: "address[]" },
      { name: "stakes", type: "uint256[]" },
      { name: "refunds", type: "bool[]" },
    ],
  },
  {
    name: "stakeOf",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "flakeId", type: "uint256" },
      { name: "participant", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "isParticipant",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "flakeId", type: "uint256" },
      { name: "participant", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "isRefundClaimed",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "flakeId", type: "uint256" },
      { name: "participant", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "oracle",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

export function buildCreateFlakeCalldata({
  flakeNumericId,
  expectedParticipants,
  feeBps = 0,
  feeRecipient,
  initialStakeRecipient,
}: {
  flakeNumericId: bigint;
  expectedParticipants: `0x${string}`[];
  feeBps?: number;
  feeRecipient: `0x${string}`;
  initialStakeRecipient: `0x${string}`;
}) {
  return encodeFunctionData({
    abi: FLEAK_ABI,
    functionName: "createFlake",
    args: [flakeNumericId, expectedParticipants, feeBps, feeRecipient, initialStakeRecipient],
  });
}

export function buildStakeCalldata(flakeNumericId: bigint, beneficiary: `0x${string}`) {
  return encodeFunctionData({
    abi: FLEAK_ABI,
    functionName: "stake",
    args: [flakeNumericId, beneficiary],
  });
}

export function buildResolveCalldata(flakeNumericId: bigint, winnerAddress: `0x${string}`) {
  return encodeFunctionData({
    abi: FLEAK_ABI,
    functionName: "resolveFlake",
    args: [flakeNumericId, winnerAddress],
  });
}

export function buildOpenRefundsCalldata(flakeNumericId: bigint) {
  return encodeFunctionData({
    abi: FLEAK_ABI,
    functionName: "openRefunds",
    args: [flakeNumericId],
  });
}

export function buildWithdrawRefundCalldata(flakeNumericId: bigint) {
  return encodeFunctionData({
    abi: FLEAK_ABI,
    functionName: "withdrawRefund",
    args: [flakeNumericId],
  });
}

// Mantener compatibilidad con código existente
export function buildDepositCalldata(flakeNumericId: bigint) {
  // Por defecto usa address(0) como beneficiary para que el contrato use msg.sender
  return buildStakeCalldata(flakeNumericId, "0x0000000000000000000000000000000000000000");
}

// ============================================================================
// HELPERS PARA EJECUTAR TRANSACCIONES COMO ORACLE
// ============================================================================

/**
 * Obtiene el chain correcto según chainId
 */
function getChain(chainId: number) {
  if (chainId === 8453) return base;
  if (chainId === 84532) return baseSepolia;
  throw new Error(`Unsupported chainId: ${chainId}`);
}

/**
 * Crea un cliente público para leer del contrato
 */
export function getPublicClient(chainId: number) {
  const chain = getChain(chainId);
  return createPublicClient({
    chain,
    transport: http(),
  });
}

/**
 * Crea un wallet client con la private key del Oracle
 */
export function getOracleWalletClient(
  chainId: number,
  oraclePrivateKey: `0x${string}`
) {
  const chain = getChain(chainId);
  const account = privateKeyToAccount(oraclePrivateKey);

  return createWalletClient({
    account,
    chain,
    transport: http(),
  });
}

/**
 * Lee el estado de un flake directamente del contrato
 */
export async function readFlakeOnChain({
  chainId,
  contractAddress,
  flakeNumericId,
}: {
  chainId: number;
  contractAddress: Address;
  flakeNumericId: bigint;
}) {
  const publicClient = getPublicClient(chainId);

  const result = await publicClient.readContract({
    address: contractAddress,
    abi: FLEAK_ABI,
    functionName: "getFlake",
    args: [flakeNumericId],
  });

  return result;
}

/**
 * Lee el stake de un participante directamente del contrato
 */
export async function readStakeOnChain({
  chainId,
  contractAddress,
  flakeNumericId,
  participantAddress,
}: {
  chainId: number;
  contractAddress: Address;
  flakeNumericId: bigint;
  participantAddress: Address;
}) {
  const publicClient = getPublicClient(chainId);

  const stake = await publicClient.readContract({
    address: contractAddress,
    abi: FLEAK_ABI,
    functionName: "stakeOf",
    args: [flakeNumericId, participantAddress],
  });

  return stake;
}

/**
 * Ejecuta la transacción de resolveFlake como Oracle
 */
export async function executeResolveFlake({
  chainId,
  contractAddress,
  flakeNumericId,
  winnerAddress,
  oraclePrivateKey,
}: {
  chainId: number;
  contractAddress: Address;
  flakeNumericId: bigint;
  winnerAddress: Address;
  oraclePrivateKey: `0x${string}`;
}): Promise<Hash> {
  const walletClient = getOracleWalletClient(chainId, oraclePrivateKey);

  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: FLEAK_ABI,
    functionName: "resolveFlake",
    args: [flakeNumericId, winnerAddress],
    chain: walletClient.chain,
  });

  return hash;
}

/**
 * Ejecuta la transacción de openRefunds como Oracle
 */
export async function executeOpenRefunds({
  chainId,
  contractAddress,
  flakeNumericId,
  oraclePrivateKey,
}: {
  chainId: number;
  contractAddress: Address;
  flakeNumericId: bigint;
  oraclePrivateKey: `0x${string}`;
}): Promise<Hash> {
  const walletClient = getOracleWalletClient(chainId, oraclePrivateKey);

  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: FLEAK_ABI,
    functionName: "openRefunds",
    args: [flakeNumericId],
    chain: walletClient.chain,
  });

  return hash;
}

/**
 * Espera la confirmación de una transacción
 */
export async function waitForTransaction({
  chainId,
  hash,
  confirmations = 1,
}: {
  chainId: number;
  hash: Hash;
  confirmations?: number;
}) {
  const publicClient = getPublicClient(chainId);

  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
    confirmations,
  });

  return receipt;
}
