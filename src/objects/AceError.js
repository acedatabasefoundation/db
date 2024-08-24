export class AceError extends Error {
  /**
   * @param { string } id 
   * @param { string } message 
   * @param { { [ k: string ]: any } } details 
   */
  constructor(id, message, details) {
    super(message)
    this.name = id + ': ' + JSON.stringify(details, null, 2)
  }
}
