export namespace security {
    export { sign };
    export { verify };
    export { encrypt };
    export { decrypt };
    export { createJWKs };
    export { getRandomBase64 };
    export { secureAce as ace };
}
export { ace } from "./ace/ace.js";
import { sign } from './security/hash.js';
import { verify } from './security/hash.js';
import { encrypt } from './security/crypt.js';
import { decrypt } from './security/crypt.js';
import { createJWKs } from './security/createJWKs.js';
import { getRandomBase64 } from './security/getRandomBase64.js';
import { secureAce } from './security/secureAce.js';
export { td, enums } from "#ace";
export { vars, getNow } from "./util/variables.js";
//# sourceMappingURL=index.d.ts.map