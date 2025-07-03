// Navigation
function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  // Remove active class from all nav buttons
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Show selected page
  document.getElementById(pageId).classList.add("active");

  // Add active class to clicked button
  event.target.classList.add("active");
}

// RC4 Implementation
class RC4 {
  constructor(key) {
    this.key = key;
    this.S = [];
    this.keyScheduling();
  }

  keyScheduling() {
    const keyBytes = new TextEncoder().encode(this.key);

    // initialize s array with values 0-255
    for (let i = 0; i < 256; i++) {
      this.S[i] = i;
    }

    // shuffle S array based on the key
    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + this.S[i] + keyBytes[i % keyBytes.length]) % 256;
      [this.S[i], this.S[j]] = [this.S[j], this.S[i]];
    }
  }

  encrypt(plaintext) {
    const data = new TextEncoder().encode(plaintext);
    const result = new Uint8Array(data.length);

    let i = 0,
      j = 0;
    for (let k = 0; k < data.length; k++) {
      // Pseudo-random generation algorithm
      i = (i + 1) % 256;
      j = (j + this.S[i]) % 256;
      [this.S[i], this.S[j]] = [this.S[j], this.S[i]];
      // Generate key byte and XOR with plaintext
      const keyByte = this.S[(this.S[i] + this.S[j]) % 256];
      result[k] = data[k] ^ keyByte; //XOR operation
    }
    // then return it as hex string
    return Array.from(result)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  decrypt(ciphertext) {
    // Convert hex string back to bytes
    const bytes = [];
    for (let i = 0; i < ciphertext.length; i += 2) {
      bytes.push(parseInt(ciphertext.substr(i, 2), 16));
    }

    // Reset S array
    this.keyScheduling();

    // Decrypt (same as encrypt)
    const result = new Uint8Array(bytes.length);
    let i = 0,
      j = 0;
    for (let k = 0; k < bytes.length; k++) {
      i = (i + 1) % 256;
      j = (j + this.S[i]) % 256;
      [this.S[i], this.S[j]] = [this.S[j], this.S[i]];

      const keyByte = this.S[(this.S[i] + this.S[j]) % 256];
      result[k] = bytes[k] ^ keyByte;
    }

    return new TextDecoder().decode(result);
  }
}

// Event Listeners for RC4
function rc4Encrypt() {
  const key = document.getElementById("rc4-key").value;
  const text = document.getElementById("rc4-text").value;

  const rc4 = new RC4(key);
  const encrypted = rc4.encrypt(text);

  const result = document.getElementById("rc4-result");
  result.textContent = `Encrypted: ${encrypted}`;
  result.style.display = "block";

  // Copy to clipboard
  navigator.clipboard.writeText(encrypted).then(() => {
    const copyMsg = document.createElement("span");
    copyMsg.textContent = " (copied to clipboard)";
    copyMsg.style.color = "#4CAF50";
    copyMsg.style.fontSize = "0.8em";
    copyMsg.style.marginLeft = "5px";

    result.appendChild(copyMsg);

    // Remove the message after 2 seconds
    setTimeout(() => {
      result.removeChild(copyMsg);
    }, 2000);
  });
}

function rc4Decrypt() {
  const key = document.getElementById("rc4-key").value;
  const text = document.getElementById("rc4-text").value;

  try {
    const rc4 = new RC4(key);
    const decrypted = rc4.decrypt(text);

    const result = document.getElementById("rc4-result");
    result.textContent = `Decrypted: ${decrypted}`;
    result.style.display = "block";
  } catch (e) {
    alert("Error: Invalid ciphertext. Please check your input and try again.");
    console.error(e);
  }
}

// Initialize typing effect
window.addEventListener("load", () => {
  const title = document.querySelector("h1");
  const originalText = title.textContent;
  title.textContent = "";
  typeWriter(title, originalText);
});

// Typewriter effect
function typeWriter(element, text, speed = 100) {
  let i = 0;
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

// DES Implementation
class SimpleDES {
  constructor(key) {
    this.key = key.padEnd(8, " ").substring(0, 8); // Ensure 8-byte key
    this.subKeys = this.generateSubKeys();
  }

  // Permutation tables
  PC1() {
    return [
      57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43,
      35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54,
      46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4,
    ];
  }

  PC2() {
    return [
      14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7,
      27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39,
      56, 34, 53, 46, 42, 50, 36, 29, 32,
    ];
  }

  IP() {
    return [
      58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46,
      38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8, 57, 49, 41, 33, 25, 17,
      9, 1, 59, 51, 43, 35, 27, 19, 11, 3, 61, 53, 45, 37, 29, 21, 13, 5, 63,
      55, 47, 39, 31, 23, 15, 7,
    ];
  }

  FP() {
    return [
      40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46,
      14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20,
      60, 28, 35, 3, 43, 11, 51, 19, 59, 27, 34, 2, 42, 10, 50, 18, 58, 26, 33,
      1, 41, 9, 49, 17, 57, 25,
    ];
  }

  E() {
    return [
      32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15,
      16, 17, 16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27,
      28, 29, 28, 29, 30, 31, 32, 1,
    ];
  }

  P() {
    return [
      16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14,
      32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25,
    ];
  }

  S() {
    return [
      [
        [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
        [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
        [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
        [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
      ],
      [
        [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
        [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
        [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
        [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9],
      ],
      [
        [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
        [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
        [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
        [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12],
      ],
      [
        [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
        [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
        [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
        [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14],
      ],
      [
        [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
        [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
        [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
        [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3],
      ],
      [
        [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
        [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
        [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
        [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13],
      ],
      [
        [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
        [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
        [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
        [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12],
      ],
      [
        [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
        [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
        [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
        [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11],
      ],
    ];
  }

  // Feistel function
  feistel(R, K) {
    // Expansion
    const E = this.permute(R, this.E());

    // XOR with round key
    const xor = E.map((bit, i) => bit ^ K[i]);

    // S-box substitution
    let sBoxOutput = [];
    const sBoxes = this.S();

    for (let i = 0; i < 8; i++) {
      const chunk = xor.slice(i * 6, (i + 1) * 6);
      const row = (chunk[0] << 1) | chunk[5];
      const col =
        (chunk[1] << 3) | (chunk[2] << 2) | (chunk[3] << 1) | chunk[4];
      const val = sBoxes[i][row][col];

      sBoxOutput.push((val >> 3) & 1, (val >> 2) & 1, (val >> 1) & 1, val & 1);
    }

    // Permutation
    return this.permute(sBoxOutput, this.P());
  }

  // Helper methods
  permute(block, table) {
    return table.map((bit) => block[bit - 1]);
  }

  leftRotate(value, shift, size = 28) {
    return [...value.slice(shift), ...value.slice(0, shift)];
  }

  // Key generation
  generateSubKeys() {
    // Convert key to binary
    const keyBits = [];
    for (let i = 0; i < this.key.length; i++) {
      const charCode = this.key.charCodeAt(i);
      for (let j = 7; j >= 0; j--) {
        keyBits.push((charCode >> j) & 1);
      }
    }

    // Apply PC1
    const pc1 = this.permute(keyBits, this.PC1());

    // Split into C0 and D0
    const C = [pc1.slice(0, 28)];
    const D = [pc1.slice(28)];

    // Generate 16 subkeys
    const subKeys = [];
    const shifts = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

    for (let i = 0; i < 16; i++) {
      // Left shift
      C.push(this.leftRotate(C[i], shifts[i]));
      D.push(this.leftRotate(D[i], shifts[i]));

      // Combine C and D
      const combined = [...C[i + 1], ...D[i + 1]];

      // Apply PC2 to get subkey
      subKeys.push(this.permute(combined, this.PC2()));
    }

    return subKeys;
  }

  // Main encryption method
  encrypt(plaintext) {
    // Convert plaintext to 64-bit blocks
    const blocks = [];
    for (let i = 0; i < plaintext.length; i += 8) {
      const block = plaintext.substring(i, i + 8).padEnd(8, " ");
      blocks.push(this.textToBlock(block));
    }

    // Encrypt each block
    const encryptedBlocks = [];
    for (const block of blocks) {
      // Apply initial permutation
      const ip = this.permute(block, this.IP());

      // Split into L0 and R0
      let L = [ip.slice(0, 32)];
      let R = [ip.slice(32)];

      // 16 rounds of Feistel network
      for (let i = 0; i < 16; i++) {
        L.push(R[i]);
        const feistel = this.feistel(R[i], this.subKeys[i]);
        const newR = L[i].map((bit, j) => bit ^ feistel[j]);
        R.push(newR);
      }

      // Combine R16 and L16 (note the order is reversed)
      const combined = [...R[16], ...L[16]];

      // Apply final permutation
      const fp = this.permute(combined, this.FP());

      // Convert to hex
      let hex = "";
      for (let i = 0; i < 64; i += 8) {
        const byte = fp.slice(i, i + 8);
        const value = byte.reduce((acc, bit, j) => acc | (bit << (7 - j)), 0);
        hex += value.toString(16).padStart(2, "0");
      }

      encryptedBlocks.push(hex);
    }

    return encryptedBlocks.join("");
  }

  // Main decryption method (same as encryption but with reversed subkeys)
  decrypt(ciphertext) {
    // Convert hex to binary blocks
    const blocks = [];
    for (let i = 0; i < ciphertext.length; i += 16) {
      const hexBlock = ciphertext.substring(i, i + 16);
      const block = [];

      for (let j = 0; j < hexBlock.length; j += 2) {
        const byte = parseInt(hexBlock.substr(j, 2), 16);
        for (let k = 7; k >= 0; k--) {
          block.push((byte >> k) & 1);
        }
      }

      blocks.push(block);
    }

    // Decrypt each block
    const decryptedBlocks = [];
    for (const block of blocks) {
      // Apply initial permutation
      const ip = this.permute(block, this.IP());

      // Split into L0 and R0
      let L = [ip.slice(0, 32)];
      let R = [ip.slice(32)];

      // 16 rounds of Feistel network with reversed subkeys
      for (let i = 0; i < 16; i++) {
        L.push(R[i]);
        const feistel = this.feistel(R[i], this.subKeys[15 - i]); // Reverse subkey order
        const newR = L[i].map((bit, j) => bit ^ feistel[j]);
        R.push(newR);
      }

      // Combine R16 and L16 (note the order is reversed)
      const combined = [...R[16], ...L[16]];

      // Apply final permutation
      const fp = this.permute(combined, this.FP());

      // Convert to text
      let text = "";
      for (let i = 0; i < 64; i += 8) {
        const byte = fp.slice(i, i + 8);
        const value = byte.reduce((acc, bit, j) => acc | (bit << (7 - j)), 0);
        text += String.fromCharCode(value);
      }

      decryptedBlocks.push(text);
    }

    return decryptedBlocks.join("").trim();
  }

  // Helper methods for text <-> block conversion
  textToBlock(text) {
    const block = [];
    for (let i = 0; i < 8; i++) {
      const charCode = i < text.length ? text.charCodeAt(i) : 32; // Space for padding
      for (let j = 7; j >= 0; j--) {
        block.push((charCode >> j) & 1);
      }
    }
    return block;
  }

  blockToText(block) {
    let text = "";
    for (let i = 0; i < 64; i += 8) {
      const byte = block.slice(i, i + 8);
      const charCode = byte.reduce((acc, bit, j) => acc | (bit << (7 - j)), 0);
      text += String.fromCharCode(charCode);
    }
    return text.trim();
  }

  // Padding methods
  pad(text) {
    const paddingLength = 8 - (text.length % 8);
    return text + " ".repeat(paddingLength);
  }

  unpad(text) {
    return text.trim();
  }
}

// Event Listeners for DES
function desEncrypt() {
  const key = document.getElementById("des-key").value;
  const text = document.getElementById("des-text").value;

  if (key.length !== 8) {
    alert("Error: Key must be exactly 8 characters long.");
    return;
  }

  const des = new SimpleDES(key);
  const encrypted = des.encrypt(text);

  const result = document.getElementById("des-result");
  result.textContent = `Encrypted: ${encrypted}`;
  result.style.display = "block";

  // Copy to clipboard
  navigator.clipboard.writeText(encrypted).then(() => {
    const copyMsg = document.createElement("span");
    copyMsg.textContent = " (copied to clipboard)";
    copyMsg.style.color = "#4CAF50";
    copyMsg.style.fontSize = "0.8em";
    copyMsg.style.marginLeft = "5px";

    result.appendChild(copyMsg);

    // Remove the message after 2 seconds
    setTimeout(() => {
      result.removeChild(copyMsg);
    }, 2000);
  });
}

function desDecrypt() {
  const key = document.getElementById("des-key").value;
  const text = document.getElementById("des-text").value;

  if (key.length !== 8) {
    alert("Error: Key must be exactly 8 characters long.");
    return;
  }

  try {
    const des = new SimpleDES(key);
    const decrypted = des.decrypt(text);

    const result = document.getElementById("des-result");
    result.textContent = `Decrypted: ${decrypted}`;
    result.style.display = "block";
  } catch (e) {
    alert("Error: Invalid ciphertext. Please check your input and try again.");
    console.error(e);
  }
}

// ChaCha20 Implementation (Simplified)
class ChaCha20 {
  constructor(key, nonce) {
    this.key = key.padEnd(32, "0").substring(0, 32);
    this.nonce = nonce.padEnd(12, "0").substring(0, 12);
  }

  quarterRound(a, b, c, d, state) {
    state[a] = (state[a] + state[b]) & 0xffffffff;
    state[d] =
      (((state[d] ^ state[a]) << 16) | ((state[d] ^ state[a]) >>> 16)) &
      0xffffffff;

    state[c] = (state[c] + state[d]) & 0xffffffff;
    state[b] =
      (((state[b] ^ state[c]) << 12) | ((state[b] ^ state[c]) >>> 20)) &
      0xffffffff;

    state[a] = (state[a] + state[b]) & 0xffffffff;
    state[d] =
      (((state[d] ^ state[a]) << 8) | ((state[d] ^ state[a]) >>> 24)) &
      0xffffffff;

    state[c] = (state[c] + state[d]) & 0xffffffff;
    state[b] =
      (((state[b] ^ state[c]) << 7) | ((state[b] ^ state[c]) >>> 25)) &
      0xffffffff;
  }

  generateKeystream(length) {
    const keyBytes = new TextEncoder().encode(this.key);
    const nonceBytes = new TextEncoder().encode(this.nonce);

    // Constants
    const constants = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574];

    // Key as 8 little-endian 32-bit words
    const keyWords = [];
    for (let i = 0; i < 8; i++) {
      keyWords.push(
        keyBytes[i * 4] |
          (keyBytes[i * 4 + 1] << 8) |
          (keyBytes[i * 4 + 2] << 16) |
          (keyBytes[i * 4 + 3] << 24)
      );
    }

    // Nonce as 3 little-endian 32-bit words
    const nonceWords = [
      nonceBytes[0] |
        (nonceBytes[1] << 8) |
        (nonceBytes[2] << 16) |
        (nonceBytes[3] << 24),
      nonceBytes[4] |
        (nonceBytes[5] << 8) |
        (nonceBytes[6] << 16) |
        (nonceBytes[7] << 24),
      nonceBytes[8] |
        (nonceBytes[9] << 8) |
        (nonceBytes[10] << 16) |
        (nonceBytes[11] << 24),
    ];

    // Initialize state
    const state = [
      ...constants,
      ...keyWords,
      0, // Counter
      ...nonceWords,
    ];

    // Generate keystream
    const keystream = new Uint8Array(length);

    for (let i = 0; i < length; i += 64) {
      // Set counter
      state[12] = Math.floor(i / 64);

      // Make a copy of the state
      const workingState = [...state];

      // 20 rounds (10 column rounds and 10 diagonal rounds)
      for (let round = 0; round < 10; round++) {
        // Column rounds
        this.quarterRound(0, 4, 8, 12, workingState);
        this.quarterRound(1, 5, 9, 13, workingState);
        this.quarterRound(2, 6, 10, 14, workingState);
        this.quarterRound(3, 7, 11, 15, workingState);

        // Diagonal rounds
        this.quarterRound(0, 5, 10, 15, workingState);
        this.quarterRound(1, 6, 11, 12, workingState);
        this.quarterRound(2, 7, 8, 13, workingState);
        this.quarterRound(3, 4, 9, 14, workingState);
      }

      // Add the original state to the working state
      for (let j = 0; j < 16; j++) {
        workingState[j] = (workingState[j] + state[j]) & 0xffffffff;
      }

      // Convert state to bytes and add to keystream
      for (let j = 0; j < 16; j++) {
        const pos = i + j * 4;
        if (pos >= length) break;

        keystream[pos] = workingState[j] & 0xff;
        if (pos + 1 < length)
          keystream[pos + 1] = (workingState[j] >>> 8) & 0xff;
        if (pos + 2 < length)
          keystream[pos + 2] = (workingState[j] >>> 16) & 0xff;
        if (pos + 3 < length)
          keystream[pos + 3] = (workingState[j] >>> 24) & 0xff;
      }
    }

    return keystream;
  }

  encrypt(plaintext) {
    const data = new TextEncoder().encode(plaintext);
    const keystream = this.generateKeystream(data.length);

    // XOR plaintext with keystream
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      result[i] = data[i] ^ keystream[i];
    }

    // Convert to hex
    return Array.from(result)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  decrypt(ciphertext) {
    // Convert hex to bytes
    const bytes = [];
    for (let i = 0; i < ciphertext.length; i += 2) {
      bytes.push(parseInt(ciphertext.substr(i, 2), 16));
    }

    const data = new Uint8Array(bytes);
    const keystream = this.generateKeystream(data.length);

    // XOR ciphertext with keystream
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      result[i] = data[i] ^ keystream[i];
    }

    return new TextDecoder().decode(result);
  }
}

// Event Listeners for ChaCha20
function chachaEncrypt() {
  const key = document.getElementById("chacha-key").value;
  const nonce = document.getElementById("chacha-nonce").value;
  const text = document.getElementById("chacha-text").value;

  if (key.length !== 32) {
    alert("Error: Key must be exactly 32 characters long.");
    return;
  }

  if (nonce.length !== 12) {
    alert("Error: Nonce must be exactly 12 characters long.");
    return;
  }

  const chacha = new ChaCha20(key, nonce);
  const encrypted = chacha.encrypt(text);

  const result = document.getElementById("chacha-result");
  result.textContent = `Encrypted: ${encrypted}`;
  result.style.display = "block";

  // Copy to clipboard
  navigator.clipboard.writeText(encrypted).then(() => {
    const copyMsg = document.createElement("span");
    copyMsg.textContent = " (copied to clipboard)";
    copyMsg.style.color = "#4CAF50";
    copyMsg.style.fontSize = "0.8em";
    copyMsg.style.marginLeft = "5px";

    result.appendChild(copyMsg);

    // Remove the message after 2 seconds
    setTimeout(() => {
      result.removeChild(copyMsg);
    }, 2000);
  });
}

function chachaDecrypt() {
  const key = document.getElementById("chacha-key").value;
  const nonce = document.getElementById("chacha-nonce").value;
  const text = document.getElementById("chacha-text").value;

  if (key.length !== 32) {
    alert("Error: Key must be exactly 32 characters long.");
    return;
  }

  if (nonce.length !== 12) {
    alert("Error: Nonce must be exactly 12 characters long.");
    return;
  }

  try {
    const chacha = new ChaCha20(key, nonce);
    const decrypted = chacha.decrypt(text);

    const result = document.getElementById("chacha-result");
    result.textContent = `Decrypted: ${decrypted}`;
    result.style.display = "block";
  } catch (e) {
    alert("Error: Invalid ciphertext. Please check your input and try again.");
    console.error(e);
  }
}

// Add matrix rain effect
function createMatrixRain() {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.zIndex = "-1";
  canvas.style.opacity = "0.05";

  const ctx = canvas.getContext("2d");

  // Set canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Matrix characters
  const matrix = "01";
  const fontSize = 14;
  const columns = canvas.width / fontSize;

  // Drops for each column
  const drops = [];
  for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * -100;
  }

  // Draw function
  function draw() {
    // Black background with opacity
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set font and color
    ctx.fillStyle = "#0F0";
    ctx.font = fontSize + "px monospace";

    // Draw characters
    for (let i = 0; i < drops.length; i++) {
      const text = matrix[Math.floor(Math.random() * matrix.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      // Reset drop when it reaches the bottom
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      // Move drops down
      drops[i]++;
    }
  }

  // Animation loop
  setInterval(draw, 50);
}

// Initialize matrix rain on load
window.addEventListener("load", createMatrixRain);
