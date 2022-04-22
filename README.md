## About

Somewhat modified implementation that follows https://rustwasm.github.io/docs/book/introduction.html


## 🚴 Usage

### 🐑 Use `cargo generate` to Clone this Template
This project was generated from a template

```
cargo generate --git https://github.com/rustwasm/wasm-pack-template.git --name my-project
cd my-project
```

### 🛠️ Build 
from project root: 

```
wasm-pack build
```

this creates the `pkg` dir with all the WASM stuff (the binary and JSON wrappers).

### 

from `www` dir:
```
npm install
npm start
```

and go to `http://localhost:8080`


### 🔬 Test in Headless Browsers with `wasm-pack test`

```
wasm-pack test --headless --firefox
```

### 🎁 Publish to NPM with `wasm-pack publish`

```
wasm-pack publish
```

## 🔋 Batteries Included

* [`wasm-bindgen`](https://github.com/rustwasm/wasm-bindgen) for communicating
  between WebAssembly and JavaScript.

* [`console_error_panic_hook`](https://github.com/rustwasm/console_error_panic_hook)
  for logging panic messages to the developer console.

* [`wee_alloc`](https://github.com/rustwasm/wee_alloc), an allocator optimized
  for small code size.
