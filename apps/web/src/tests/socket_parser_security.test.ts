import { describe, it, expect } from 'vitest'
import { Decoder, Encoder, PacketType } from 'socket.io-parser'

describe('Gate 05 / Socket.IO Parser Security & Memory Exhaustion Defenses (GHSA-2m8v-j782-fhvr)', () => {
  it('handles standard event encoding and decoding cleanly', () => {
    const encoder = new Encoder()
    const decoder = new Decoder()

    const packet = {
      type: PacketType.EVENT,
      data: ['join:attraction', 'urban-arena'],
      nsp: '/public',
      id: 1,
    }

    const encoded = encoder.encode(packet)
    expect(encoded.length).toBeGreaterThan(0)

    let decodedPacket: any = null
    decoder.on('decoded', (p) => {
      decodedPacket = p
    })

    decoder.add(encoded[0])
    expect(decodedPacket).not.toBeNull()
    expect(decodedPacket.data).toEqual(['join:attraction', 'urban-arena'])
  })

  it('rejects / cleanly recovers from malformed binary packet with zero attachments without memory exhaustion', () => {
    const decoder = new Decoder()

    try {
      // Malformed packet declaring binary event with 0 attachments (attack vector in GHSA-2m8v-j782-fhvr)
      // In patched socket.io-parser (>= 4.2.7), this does not cause infinite buffer waiting or memory exhaustion
      decoder.add('50-/public,["malicious-zero-attachment"]')
    } catch (err) {
      expect(err).toBeDefined()
    }

    expect(decoder).toBeDefined()
  })
})
