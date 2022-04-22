# Custom Memory Allocator `wee_alloc`
- https://github.com/rustwasm/wee_alloc

- trades allocation performance for small code size. 

- wee_alloc will never return freed pages to the WebAssembly engine / operating system.
  Currently, WebAssembly can only grow its heap, and can never shrink it. All 
  allocated pages are indefinitely kept in wee_alloc's internal free lists for 
  potential future allocations, even when running on unix targets.    
 

# Interop between WASM and JS

- JavaScript, on the other hand, can read and write to the WebAssembly linear memory
  space, but only as an ArrayBuffer of scalar values (u8, i32, f64, etc...). 
  WebAssembly functions also take and return scalar values. These are the
  building blocks from which all WebAssembly and JavaScript communication is constituted.

- WebAssembly currently has no direct access to the garbage-collected heap (as of 
  April 2018, this is expected to change with the "Interface Types" proposal). 