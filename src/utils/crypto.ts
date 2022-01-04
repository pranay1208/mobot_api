import NodeRSA from "node-rsa";
import dotenv from "dotenv";
dotenv.config();
if (process.env.PRIVATE_KEY === undefined) {
  throw new Error(".env does not contain private key");
}
const actualKeyValue = Buffer.from(process.env.PRIVATE_KEY, "base64").toString(
  "ascii"
);
const private_key = new NodeRSA(actualKeyValue);

export const decryptText = (
  encryptedText: string | undefined
): string | undefined => {
  if (encryptedText === undefined) {
    return undefined;
  }
  const decryptedText = private_key.decrypt(encryptedText, "utf8");
  return decryptedText;
};
