import NodeRSA from "node-rsa";
import dotenv from 'dotenv'
dotenv.config()

const private_key = new NodeRSA(process.env.PRIVATE_KEY)

export const decryptText = (encryptedText: string | undefined) : string | undefined => {
    if(encryptedText === undefined) {
        return undefined
    }
    const decryptedText = private_key.decrypt(encryptedText, 'utf8')
    return decryptedText
}