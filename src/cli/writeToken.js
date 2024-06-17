import { stdout } from 'node:process'


/** @returns { Promise<void> } */
export async function writeToken () {
  const token = crypto.randomUUID()

  stdout.write(`Token
  1. The Ace CLI could read and write to the directory that holds your graph without calling your server
  2. But the server holds a request queue that ensures all requests happen one at a time, in the order they are recieved
  3. So the Ace CLI calls your graph by calling an endpoint on your server, so that the CLI requests goes into the queue
  4. To ensure the endpoint to your graph, on your server, is only accessible to the ClI, use this token
  5. Ace recommends storing this token in your .env file as a string and then closing this terminal window


ACE_SERVER_TOKEN='${ token }'`)
}
