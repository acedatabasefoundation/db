export function getTsConfig () {
  return `{
    "files": [
      "enums.js",
      "typedefs.js"
  ],
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true,
    "strict": true,
    "outDir": "tsc",
    "module": "NodeNext",
    "target": "ES2017"
  }
}`
}