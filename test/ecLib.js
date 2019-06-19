const BN = web3.utils.BN
const EllipticCurve = artifacts.require("./EllipticCurve")

contract("EllipticCurve", accounts => {
  describe("secp256k1", () => {
    // var n = new BN("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F", 16)
    // const gx = new BN("79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798", 16)
    // const gy = new BN("483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8", 16)
    const pp = new BN("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F", 16)
    let ecLib
    before(async () => {
      ecLib = await EllipticCurve.deployed()
    })
    it("Should convert a Jacobian point to affine", async () => {
      var x = web3.utils.toBN("0x7D152C041EA8E1DC2191843D1FA9DB55B68F88FEF695E2C791D40444B365AFC2")
      var y = web3.utils.toBN("0x56915849F52CC8F76F5FD7E4BF60DB4A43BF633E1B1383F85FE89164BFADCBDB")
      var z = web3.utils.toBN("0x9075B4EE4D4788CABB49F7F81C221151FA2F68914D0AA833388FA11FF621A970")

      const affine = await ecLib.toAffine(x, y, z, pp)
      var expectedY = web3.utils.toBN("0x1AE168FEA63DC339A3C58419466CEAEEF7F632653266D0E1236431A950CFE52A")
      var expectedX = web3.utils.toBN("0xC6047F9441ED7D6D3045406E95C07CD85C778E4B8CEF3CA7ABAC09B95C709EE5")

      assert.equal(affine[1].toString(), expectedY.toString())
      assert.equal(affine[0].toString(), expectedX.toString())
    })
    it("Invalid numbers", async () => {
      var d = new BN(0)
      try {
        // eslint-disable-next-line
        const inv = await ecLib.invMod(d, pp)
      } catch (error) {
        assert(error, "Invalid number")
      }
      try {
        // eslint-disable-next-line
        const inv = await ecLib.invMod(pp, d)
      } catch (error) {
        assert(error, "Invalid number")
      }
      try {
        // eslint-disable-next-line
        const inv = await ecLib.invMod(pp, pp)
      } catch (error) {
        assert(error, "Invalid number")
      }
    })
    it("Inverse of 1", async () => {
      var d = new BN(1)
      const inv = await ecLib.invMod(d, pp)
      assert.equal(inv.toString(10), "1")
    })
    it("Should Invert an inverted number and be the same", async () => {
      const y1 = web3.utils.toBN("0x9d42bf0c35d765c2242712205e8f8b1ea588f470a6980b21bc9efb4ab33ae246")
      const inverted = await ecLib.invMod(y1, pp)
      const newY1 = await ecLib.invMod(inverted, pp)
      assert.equal(newY1.toString(), y1.toString())
    })
    it("Should identify if point is on the curve", async () => {
      const x = web3.utils.toBN("0xe906a3b4379ddbff598994b2ff026766fb66424710776099b85111f23f8eebcc")
      const y = web3.utils.toBN("0x7638965bf85f5f2b6641324389ef2ffb99576ba72ec19d8411a5ea1dd251b112")
      assert.equal(await ecLib.isOnCurve(x, y, 0, 7, pp), true)
    })
    it("Should identify if point is NOT on the curve", async () => {
      const x = web3.utils.toBN("0x3bf754f48bc7c5fb077736c7d2abe85354be649caa94971f907b3a81759e5b5e")
      const y = web3.utils.toBN("0x6b936ce0a2a40016bbb2eb0a4a1347b5af76a41d44b56dec26108269a45bce78")
      assert.equal(await ecLib.isOnCurve(x, y, 0, 7, pp), false)
    })
    it("Should Add two big numbers", async () => {
      const x1 = web3.utils.toBN("0x3596f1f475c8999ffe35ccf7cebee7373ee40513ad467e3fc38600aa06d41bcf")
      const z1 = web3.utils.toBN("0x825a3eb4f09a55637391c950ba5e25c1ea658a15f234c14ebec79e5c68bd4133")
      const x2 = web3.utils.toBN("0x1c2a90c4c30f60e878d1fe317acf4f2e059300e3deaa1c949628096ecaf993b2")
      const z2 = web3.utils.toBN("0x62bd40f3ca289a3ddbd8eddfa17074e15a770b8f5967f4de436104b44cc519e9")
      const res = await ecLib.ecAdd(x1, z1, x2, z2, 0, pp)
      const sumX = res[0]
      const sumZ = res[1]
      const expectedSumX = web3.utils.toBN("0x957f0c13905d357d9e1ebaf32742b410d423fcf2410229d4e8093f3360d07b2c")
      const expectedSumZ = web3.utils.toBN("0x9a0d14288d3906e052bdcf12c2a469da3e7449068b3e119300b792da964ed977")
      assert.equal(sumX.toString(10), expectedSumX.toString())
      assert.equal(sumZ.toString(10), expectedSumZ.toString())
    })
    it("Should Invert an ec point", async () => {
      const x = web3.utils.toBN("0x1c2a90c4c30f60e878d1fe317acf4f2e059300e3deaa1c949628096ecaf993b2")
      const y = web3.utils.toBN("0x9d42bf0c35d765c2242712205e8f8b1ea588f470a6980b21bc9efb4ab33ae246")
      const invertedPoint = await ecLib.ecInv(x, y, pp)

      const expectedY = web3.utils.toBN("0x62bd40f3ca289a3ddbd8eddfa17074e15a770b8f5967f4de436104b44cc519e9")
      assert.equal(invertedPoint[0].toString(), x.toString())
      assert.equal(invertedPoint[1].toString(), expectedY.toString())
    })
    it("Should Sub two big numbers", async () => {
      const x1 = web3.utils.toBN("0x3596f1f475c8999ffe35ccf7cebee7373ee40513ad467e3fc38600aa06d41bcf")
      const z1 = web3.utils.toBN("0x825a3eb4f09a55637391c950ba5e25c1ea658a15f234c14ebec79e5c68bd4133")
      const x2 = web3.utils.toBN("0x1c2a90c4c30f60e878d1fe317acf4f2e059300e3deaa1c949628096ecaf993b2")
      const z2 = web3.utils.toBN("0x9d42bf0c35d765c2242712205e8f8b1ea588f470a6980b21bc9efb4ab33ae246")
      const res = await ecLib.ecSub(x1, z1, x2, z2, 0, pp)
      const sumX = res[0]
      const sumZ = res[1]
      const expectedSubX = web3.utils.toBN("0x957f0c13905d357d9e1ebaf32742b410d423fcf2410229d4e8093f3360d07b2c")
      const expectedSubY = web3.utils.toBN("0x9a0d14288d3906e052bdcf12c2a469da3e7449068b3e119300b792da964ed977")
      assert.equal(sumX.toString(10), expectedSubX.toString())
      assert.equal(sumZ.toString(10), expectedSubY.toString())
    })
    it("Should double EcPoint", async () => {
      const x1 = web3.utils.toBN("0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798")
      const y1 = web3.utils.toBN("0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8")
      const res = await ecLib.ecAdd(x1, y1, x1, y1, 0, pp)
      const mulX = res[0]
      const mulZ = res[1]
      const expectedMulX = web3.utils.toBN("0xC6047F9441ED7D6D3045406E95C07CD85C778E4B8CEF3CA7ABAC09B95C709EE5")
      const expectedMulY = web3.utils.toBN("0x1AE168FEA63DC339A3C58419466CEAEEF7F632653266D0E1236431A950CFE52A")
      assert.equal(mulX.toString(10), expectedMulX.toString())
      assert.equal(mulZ.toString(10), expectedMulY.toString())
    })
    it("Should Add two big numbers", async () => {
      const x1 = web3.utils.toBN("0xC6047F9441ED7D6D3045406E95C07CD85C778E4B8CEF3CA7ABAC09B95C709EE5")
      const z1 = web3.utils.toBN("0x1AE168FEA63DC339A3C58419466CEAEEF7F632653266D0E1236431A950CFE52A")
      const res = await ecLib.ecAdd(x1, z1, 0, 0, 0, pp)
      const sumX = res[0]
      const sumZ = res[1]
      assert.equal(sumX.toString(10), x1.toString())
      assert.equal(sumZ.toString(10), z1.toString())
    })

    it("Should multiply x2 EcPoint", async () => {
      const x1 = web3.utils.toBN("0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798")
      const y1 = web3.utils.toBN("0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8")
      const d = web3.utils.toBN("0x07")
      const res = await ecLib.ecMul(d, x1, y1, 0, pp)
      const mulX = res[0]
      const mulZ = res[1]
      const expectedMulX = web3.utils.toBN("0x5CBDF0646E5DB4EAA398F365F2EA7A0E3D419B7E0330E39CE92BDDEDCAC4F9BC")
      const expectedMulY = web3.utils.toBN("0x6AEBCA40BA255960A3178D6D861A54DBA813D0B813FDE7B5A5082628087264DA")
      assert.equal(mulX.toString(10), expectedMulX.toString())
      assert.equal(mulZ.toString(10), expectedMulY.toString())
    })

    it("Should multiply small scalar with EcPoint", async () => {
      const x1 = web3.utils.toBN("0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798")
      const y1 = web3.utils.toBN("0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8")
      const d = web3.utils.toBN("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140")
      const res = await ecLib.ecMul(d, x1, y1, 0, pp)
      const mulX = res[0]
      const mulZ = res[1]
      const expectedMulX = web3.utils.toBN("0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798")
      const expectedMulY = web3.utils.toBN("0xB7C52588D95C3B9AA25B0403F1EEF75702E84BB7597AABE663B82F6F04EF2777")
      assert.equal(mulX.toString(10), expectedMulX.toString())
      assert.equal(mulZ.toString(10), expectedMulY.toString())
    })
    it("Should multiply big scalar with EcPoint", async () => {
      const x1 = web3.utils.toBN("0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798")
      const y1 = web3.utils.toBN("0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8")
      const d = web3.utils.toBN("0x05")
      const res = await ecLib.ecMul(d, x1, y1, 0, pp)
      const mulX = res[0]
      const mulZ = res[1]
      const expectedMulX = web3.utils.toBN("0x2F8BDE4D1A07209355B4A7250A5C5128E88B84BDDC619AB7CBA8D569B240EFE4")
      const expectedMulY = web3.utils.toBN("0xD8AC222636E5E3D6D4DBA9DDA6C9C426F788271BAB0D6840DCA87D3AA6AC62D6")
      assert.equal(mulX.toString(10), expectedMulX.toString())
      assert.equal(mulZ.toString(10), expectedMulY.toString())
    })
  })
  describe("secp256r1", () => {
    // var n = new BN("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F", 16)
    // const gx = new BN("79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798", 16)
    // const gy = new BN("483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8", 16)
    const pp = new BN("FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF", 16)
    const a = new BN("FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC", 16)
    const b = new BN("5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B", 16)

    let ecLib
    before(async () => {
      ecLib = await EllipticCurve.deployed()
    })
    it("Should convert a Jacobian point to affine", async () => {
      var x = web3.utils.toBN("0x88E6BB871813A28C4E9AFDCD94B79D85DE4794A3C4695B311FB3C7EF1CECE619")
      var y = web3.utils.toBN("0x3D709DD3A0B3293201BCEE8E02249399DB3C130F2642C8F954417DC639ADDD22")
      var z = web3.utils.toBN("0xEEEAA21B71DA080527B358D3EE861B774FB5BCC79D304533C096F3A44F0E7A2")

      const affine = await ecLib.toAffine(x, y, z, pp)
      var expectedX = web3.utils.toBN("0xE2534A3532D08FBBA02DDE659EE62BD0031FE2DB785596EF509302446B030852")
      var expectedY = web3.utils.toBN("0xE0F1575A4C633CC719DFEE5FDA862D764EFC96C3F30EE0055C42C23F184ED8C6")

      assert.equal(affine[0].toString(), expectedX.toString())
      assert.equal(affine[1].toString(), expectedY.toString())
    })
    it("Invalid numbers", async () => {
      var d = new BN(0)
      try {
        // eslint-disable-next-line
        const inv = await ecLib.invMod(d, pp)
      } catch (error) {
        assert(error, "Invalid number")
      }
      try {
        // eslint-disable-next-line
        const inv = await ecLib.invMod(pp, d)
      } catch (error) {
        assert(error, "Invalid number")
      }
      try {
        // eslint-disable-next-line
        const inv = await ecLib.invMod(pp, pp)
      } catch (error) {
        assert(error, "Invalid number")
      }
    })
    it("Inverse of 1", async () => {
      var d = new BN(1)
      const inv = await ecLib.invMod(d, pp)
      assert.equal(inv.toString(10), "1")
    })
    it("Should Invert an inverted number and be the same", async () => {
      const y1 = web3.utils.toBN("0x9d42bf0c35d765c2242712205e8f8b1ea588f470a6980b21bc9efb4ab33ae246")
      const inverted = await ecLib.invMod(y1, pp)
      const newY1 = await ecLib.invMod(inverted, pp)
      assert.equal(newY1.toString(), y1.toString())
    })
    it("Should identify if point is on the curve", async () => {
      const x = web3.utils.toBN("0x6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296")
      const y = web3.utils.toBN("0x4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5")
      assert.equal(await ecLib.isOnCurve(x, y, a, b, pp), true)
    })
    it("Should identify if point is NOT on the curve", async () => {
      const x = web3.utils.toBN("0x6B17D1F3E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296")
      const y = web3.utils.toBN("0x4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5")
      assert.equal(await ecLib.isOnCurve(x, y, a, b, pp), false)
    })
    it("Should Add two big numbers", async () => {
      const x1 = web3.utils.toBN("0x6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296")
      const z1 = web3.utils.toBN("0x4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5")
      const x2 = web3.utils.toBN("0x5ECBE4D1A6330A44C8F7EF951D4BF165E6C6B721EFADA985FB41661BC6E7FD6C")
      const z2 = web3.utils.toBN("0x8734640C4998FF7E374B06CE1A64A2ECD82AB036384FB83D9A79B127A27D5032")
      const res = await ecLib.ecAdd(x1, z1, x2, z2, a, pp)
      const sumX = res[0]
      const sumZ = res[1]
      const expectedSumX = web3.utils.toBN("0xE2534A3532D08FBBA02DDE659EE62BD0031FE2DB785596EF509302446B030852")
      const expectedSumZ = web3.utils.toBN("0xE0F1575A4C633CC719DFEE5FDA862D764EFC96C3F30EE0055C42C23F184ED8C6")
      assert.equal(sumX.toString(10), expectedSumX.toString())
      assert.equal(sumZ.toString(10), expectedSumZ.toString())
    })
    it("Should Invert an ec point", async () => {
      const x = web3.utils.toBN("0x7CF27B188D034F7E8A52380304B51AC3C08969E277F21B35A60B48FC47669978")
      const y = web3.utils.toBN("0x7775510DB8ED040293D9AC69F7430DBBA7DADE63CE982299E04B79D227873D1")
      const invertedPoint = await ecLib.ecInv(x, y, pp)

      const expectedY = web3.utils.toBN("0xF888AAEE24712FC0D6C26539608BCF244582521AC3167DD661FB4862DD878C2E")
      assert.equal(invertedPoint[0].toString(), x.toString())
      assert.equal(invertedPoint[1].toString(), expectedY.toString())
    })
    it("Should Sub two big numbers", async () => {
      const x1 = web3.utils.toBN("0x5ECBE4D1A6330A44C8F7EF951D4BF165E6C6B721EFADA985FB41661BC6E7FD6C")
      const z1 = web3.utils.toBN("0x8734640C4998FF7E374B06CE1A64A2ECD82AB036384FB83D9A79B127A27D5032")
      const x2 = web3.utils.toBN("0x6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296")
      const z2 = web3.utils.toBN("0x4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5")
      const res = await ecLib.ecSub(x1, z1, x2, z2, a, pp)
      const sumX = res[0]
      const sumZ = res[1]
      const expectedSubX = web3.utils.toBN("0x7CF27B188D034F7E8A52380304B51AC3C08969E277F21B35A60B48FC47669978")
      const expectedSubY = web3.utils.toBN("0x7775510DB8ED040293D9AC69F7430DBBA7DADE63CE982299E04B79D227873D1")
      assert.equal(sumX.toString(10), expectedSubX.toString())
      assert.equal(sumZ.toString(10), expectedSubY.toString())
    })
    it("Should double EcPoint", async () => {
      const x1 = web3.utils.toBN("0x7CF27B188D034F7E8A52380304B51AC3C08969E277F21B35A60B48FC47669978")
      const y1 = web3.utils.toBN("0x7775510DB8ED040293D9AC69F7430DBBA7DADE63CE982299E04B79D227873D1")
      const res = await ecLib.ecAdd(x1, y1, x1, y1, a, pp)
      const mulX = res[0]
      const mulZ = res[1]
      const expectedMulX = web3.utils.toBN("0xE2534A3532D08FBBA02DDE659EE62BD0031FE2DB785596EF509302446B030852")
      const expectedMulY = web3.utils.toBN("0xE0F1575A4C633CC719DFEE5FDA862D764EFC96C3F30EE0055C42C23F184ED8C6")
      assert.equal(mulX.toString(10), expectedMulX.toString())
      assert.equal(mulZ.toString(10), expectedMulY.toString())
    })
    it("Should Add two big numbers", async () => {
      const x1 = web3.utils.toBN("0x6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296")
      const z1 = web3.utils.toBN("0x4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5")
      const res = await ecLib.ecAdd(x1, z1, 0, 0, a, pp)
      const sumX = res[0]
      const sumZ = res[1]
      assert.equal(sumX.toString(10), x1.toString())
      assert.equal(sumZ.toString(10), z1.toString())
    })

    it("Should multiply x2 EcPoint", async () => {
      const x1 = web3.utils.toBN("0x6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296")
      const y1 = web3.utils.toBN("0x4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5")
      const d = web3.utils.toBN("0x02")
      const res = await ecLib.ecMul(d, x1, y1, a, pp)
      const mulX = res[0]
      const mulZ = res[1]
      const expectedMulX = web3.utils.toBN("0x7CF27B188D034F7E8A52380304B51AC3C08969E277F21B35A60B48FC47669978")
      const expectedMulY = web3.utils.toBN("0x7775510DB8ED040293D9AC69F7430DBBA7DADE63CE982299E04B79D227873D1")
      assert.equal(mulX.toString(10), expectedMulX.toString())
      assert.equal(mulZ.toString(10), expectedMulY.toString())
    })

    it("Should multiply x EcPoint", async () => {
      const x1 = web3.utils.toBN("0x6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296")
      const y1 = web3.utils.toBN("0x4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5")
      const d = web3.utils.toBN("0x03")
      const res = await ecLib.ecMul(d, x1, y1, a, pp)
      const mulX = res[0]
      const mulZ = res[1]
      const expectedMulX = web3.utils.toBN("0x5ECBE4D1A6330A44C8F7EF951D4BF165E6C6B721EFADA985FB41661BC6E7FD6C")
      const expectedMulY = web3.utils.toBN("0x8734640C4998FF7E374B06CE1A64A2ECD82AB036384FB83D9A79B127A27D5032")
      assert.equal(mulX.toString(10), expectedMulX.toString())
      assert.equal(mulZ.toString(10), expectedMulY.toString())
    })
    it("Should multiply small scalar with EcPoint", async () => {
      const x1 = web3.utils.toBN("0x6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296")
      const y1 = web3.utils.toBN("0x4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5")
      const res = await ecLib.ecMul(0x04, x1, y1, a, pp)
      const mulX = res[0]
      const mulZ = res[1]
      const expectedMulX = web3.utils.toBN("0xE2534A3532D08FBBA02DDE659EE62BD0031FE2DB785596EF509302446B030852")
      const expectedMulY = web3.utils.toBN("0xE0F1575A4C633CC719DFEE5FDA862D764EFC96C3F30EE0055C42C23F184ED8C6")
      assert.equal(mulX.toString(10), expectedMulX.toString())
      assert.equal(mulZ.toString(10), expectedMulY.toString())
    })
    it("Should multiply big scalar with EcPoint", async () => {
      const x1 = web3.utils.toBN("0x6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296")
      const y1 = web3.utils.toBN("0x4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5")
      const d = web3.utils.toBN("0x159D893D4CDD747246CDCA43590E13")
      const res = await ecLib.ecMul(d, x1, y1, a, pp)
      const mulX = res[0]
      const mulZ = res[1]
      const expectedMulX = web3.utils.toBN("0x1B7E046A076CC25E6D7FA5003F6729F665CC3241B5ADAB12B498CD32F2803264")
      const expectedMulY = web3.utils.toBN("0xBFEA79BE2B666B073DB69A2A241ADAB0738FE9D2DD28B5604EB8C8CF097C457B")
      assert.equal(mulX.toString(10), expectedMulX.toString())
      assert.equal(mulZ.toString(10), expectedMulY.toString())
    })
  })
  describe("secp192r1", () => {
    // var n = new BN("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F", 16)
    // const gx = new BN("79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798", 16)
    // const gy = new BN("483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8", 16)
    const pp = new BN("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFF", 16)
    const a = new BN("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFC", 16)
    const b = new BN("64210519E59C80E70FA7E9AB72243049FEB8DEECC146B9B1", 16)

    let ecLib
    before(async () => {
      ecLib = await EllipticCurve.deployed()
    })
    it("Should Add two big numbers", async () => {
      const x1 = web3.utils.toBN("0x188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF1012")
      const z1 = web3.utils.toBN("0x7192B95FFC8DA78631011ED6B24CDD573F977A11E794811")
      const x2 = web3.utils.toBN("0xDAFEBF5828783F2AD35534631588A3F629A70FB16982A888")
      const z2 = web3.utils.toBN("0xDD6BDA0D993DA0FA46B27BBC141B868F59331AFA5C7E93AB")
      const res = await ecLib.ecAdd(x1, z1, x2, z2, a, pp)
      const sumX = res[0]
      const sumZ = res[1]
      const expectedSumX = web3.utils.toBN("0x76E32A2557599E6EDCD283201FB2B9AADFD0D359CBB263DA")
      const expectedSumZ = web3.utils.toBN("0x782C37E372BA4520AA62E0FED121D49EF3B543660CFD05FD")
      assert.equal(sumX.toString(10), expectedSumX.toString())
      assert.equal(sumZ.toString(10), expectedSumZ.toString())
    })
    it("Should Sub two big numbers", async () => {
      const x1 = web3.utils.toBN("0x10BB8E9840049B183E078D9C300E1605590118EBDD7FF590")
      const z1 = web3.utils.toBN("0x31361008476F917BADC9F836E62762BE312B72543CCEAEA1")
      const x2 = web3.utils.toBN("0x76E32A2557599E6EDCD283201FB2B9AADFD0D359CBB263DA")
      const z2 = web3.utils.toBN("0x782C37E372BA4520AA62E0FED121D49EF3B543660CFD05FD")
      const res = await ecLib.ecSub(x1, z1, x2, z2, a, pp)
      const sumX = res[0]
      const sumZ = res[1]
      const expectedSubX = web3.utils.toBN("0xDAFEBF5828783F2AD35534631588A3F629A70FB16982A888")
      const expectedSubY = web3.utils.toBN("0xDD6BDA0D993DA0FA46B27BBC141B868F59331AFA5C7E93AB")
      assert.equal(sumX.toString(10), expectedSubX.toString())
      assert.equal(sumZ.toString(10), expectedSubY.toString())
    })
    it("Should double EcPoint", async () => {
      const x1 = web3.utils.toBN("0x188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF1012")
      const y1 = web3.utils.toBN("0x7192B95FFC8DA78631011ED6B24CDD573F977A11E794811")
      const res = await ecLib.ecAdd(x1, y1, x1, y1, a, pp)
      const mulX = res[0]
      const mulZ = res[1]
      const expectedMulX = web3.utils.toBN("0xDAFEBF5828783F2AD35534631588A3F629A70FB16982A888")
      const expectedMulY = web3.utils.toBN("0xDD6BDA0D993DA0FA46B27BBC141B868F59331AFA5C7E93AB")
      assert.equal(mulX.toString(10), expectedMulX.toString())
      assert.equal(mulZ.toString(10), expectedMulY.toString())
    })
    it("Should Add two big numbers", async () => {
      const x1 = web3.utils.toBN("0x188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF1012")
      const z1 = web3.utils.toBN("0x7192B95FFC8DA78631011ED6B24CDD573F977A11E794811")
      const res = await ecLib.ecAdd(x1, z1, 0, 0, a, pp)
      const sumX = res[0]
      const sumZ = res[1]
      assert.equal(sumX.toString(10), x1.toString())
      assert.equal(sumZ.toString(10), z1.toString())
    })

    it("Should multiply x2 EcPoint", async () => {
      const x1 = web3.utils.toBN("0xDAFEBF5828783F2AD35534631588A3F629A70FB16982A888")
      const y1 = web3.utils.toBN("0xDD6BDA0D993DA0FA46B27BBC141B868F59331AFA5C7E93AB")
      const d = web3.utils.toBN("0x02")
      const res = await ecLib.ecMul(d, x1, y1, a, pp)
      const mulX = res[0]
      const mulZ = res[1]
      const expectedMulX = web3.utils.toBN("0x35433907297CC378B0015703374729D7A4FE46647084E4BA")
      const expectedMulY = web3.utils.toBN("0xA2649984F2135C301EA3ACB0776CD4F125389B311DB3BE32")
      assert.equal(mulX.toString(10), expectedMulX.toString())
      assert.equal(mulZ.toString(10), expectedMulY.toString())
    })

    it("Should multiply x EcPoint", async () => {
      const x1 = web3.utils.toBN("0x188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF1012")
      const y1 = web3.utils.toBN("0x7192B95FFC8DA78631011ED6B24CDD573F977A11E794811")
      const d = web3.utils.toBN("0x03")
      const res = await ecLib.ecMul(d, x1, y1, a, pp)
      const mulX = res[0]
      const mulZ = res[1]
      const expectedMulX = web3.utils.toBN("0x76E32A2557599E6EDCD283201FB2B9AADFD0D359CBB263DA")
      const expectedMulY = web3.utils.toBN("0x782C37E372BA4520AA62E0FED121D49EF3B543660CFD05FD")
      assert.equal(mulX.toString(10), expectedMulX.toString())
      assert.equal(mulZ.toString(10), expectedMulY.toString())
    })
    it("Should multiply small scalar with EcPoint", async () => {
      const x1 = web3.utils.toBN("0x188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF1012")
      const y1 = web3.utils.toBN("0x7192B95FFC8DA78631011ED6B24CDD573F977A11E794811")
      const res = await ecLib.ecMul(0x04, x1, y1, a, pp)
      const mulX = res[0]
      const mulZ = res[1]
      const expectedMulX = web3.utils.toBN("0x35433907297CC378B0015703374729D7A4FE46647084E4BA")
      const expectedMulY = web3.utils.toBN("0xA2649984F2135C301EA3ACB0776CD4F125389B311DB3BE32")
      assert.equal(mulX.toString(10), expectedMulX.toString())
      assert.equal(mulZ.toString(10), expectedMulY.toString())
    })
    it("Should multiply big scalar with EcPoint", async () => {
      const x1 = web3.utils.toBN("0x188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF1012")
      const y1 = web3.utils.toBN("0x7192B95FFC8DA78631011ED6B24CDD573F977A11E794811")
      const d = web3.utils.toBN("0x159D893D4CDD747246CDCA43590E13")
      const res = await ecLib.ecMul(d, x1, y1, a, pp)
      const mulX = res[0]
      const mulZ = res[1]
      const expectedMulX = web3.utils.toBN("0xB357B10AC985C891B29FB37DA56661CCCF50CEC21128D4F6")
      const expectedMulY = web3.utils.toBN("0xBA20DC2FA1CC228D3C2D8B538C2177C2921884C6B7F0D96F")
      assert.equal(mulX.toString(10), expectedMulX.toString())
      assert.equal(mulZ.toString(10), expectedMulY.toString())
    })
  })
  describe("secp224r1", () => {
    // var n = new BN("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F", 16)
    // const gx = new BN("79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798", 16)
    // const gy = new BN("483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8", 16)
    const pp = new BN("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000001", 16)
    const a = new BN("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFE", 16)
    const b = new BN("B4050A850C04B3ABF54132565044B0B7D7BFD8BA270B39432355FFB4", 16)

    let ecLib
    before(async () => {
      ecLib = await EllipticCurve.deployed()
    })
    it("Should Add two big numbers", async () => {
      const x1 = web3.utils.toBN("0xB70E0CBD6BB4BF7F321390B94A03C1D356C21122343280D6115C1D21")
      const z1 = web3.utils.toBN("0xBD376388B5F723FB4C22DFE6CD4375A05A07476444D5819985007E34")
      const x2 = web3.utils.toBN("0x706A46DC76DCB76798E60E6D89474788D16DC18032D268FD1A704FA6")
      const z2 = web3.utils.toBN("0x1C2B76A7BC25E7702A704FA986892849FCA629487ACF3709D2E4E8BB")
      const res = await ecLib.ecAdd(x1, z1, x2, z2, a, pp)
      const sumX = res[0]
      const sumZ = res[1]
      const expectedSumX = web3.utils.toBN("0xDF1B1D66A551D0D31EFF822558B9D2CC75C2180279FE0D08FD896D04")
      const expectedSumZ = web3.utils.toBN("0xA3F7F03CADD0BE444C0AA56830130DDF77D317344E1AF3591981A925")
      assert.equal(sumX.toString(10), expectedSumX.toString())
      assert.equal(sumZ.toString(10), expectedSumZ.toString())
    })
    it("Should Sub two big numbers", async () => {
      const x1 = web3.utils.toBN("0x31C49AE75BCE7807CDFF22055D94EE9021FEDBB5AB51C57526F011AA")
      const z1 = web3.utils.toBN("0x27E8BFF1745635EC5BA0C9F1C2EDE15414C6507D29FFE37E790A079B")
      const x2 = web3.utils.toBN("0xDF1B1D66A551D0D31EFF822558B9D2CC75C2180279FE0D08FD896D04")
      const z2 = web3.utils.toBN("0xA3F7F03CADD0BE444C0AA56830130DDF77D317344E1AF3591981A925")
      const res = await ecLib.ecSub(x1, z1, x2, z2, a, pp)
      const sumX = res[0]
      const sumZ = res[1]
      const expectedSubX = web3.utils.toBN("0x706A46DC76DCB76798E60E6D89474788D16DC18032D268FD1A704FA6")
      const expectedSubY = web3.utils.toBN("0x1C2B76A7BC25E7702A704FA986892849FCA629487ACF3709D2E4E8BB")
      assert.equal(sumX.toString(10), expectedSubX.toString())
      assert.equal(sumZ.toString(10), expectedSubY.toString())
    })
    it("Should double EcPoint", async () => {
      const x1 = web3.utils.toBN("0xB70E0CBD6BB4BF7F321390B94A03C1D356C21122343280D6115C1D21")
      const y1 = web3.utils.toBN("0xBD376388B5F723FB4C22DFE6CD4375A05A07476444D5819985007E34")
      const res = await ecLib.ecAdd(x1, y1, x1, y1, a, pp)
      const mulX = res[0]
      const mulZ = res[1]
      const expectedMulX = web3.utils.toBN("0x706A46DC76DCB76798E60E6D89474788D16DC18032D268FD1A704FA6")
      const expectedMulY = web3.utils.toBN("0x1C2B76A7BC25E7702A704FA986892849FCA629487ACF3709D2E4E8BB")
      assert.equal(mulX.toString(10), expectedMulX.toString())
      assert.equal(mulZ.toString(10), expectedMulY.toString())
    })
    it("Should Add two big numbers", async () => {
      const x1 = web3.utils.toBN("0xB70E0CBD6BB4BF7F321390B94A03C1D356C21122343280D6115C1D21")
      const z1 = web3.utils.toBN("0xB70E0CBD6BB4BF7F321390B94A03C1D356C21122343280D6115C1D21")
      const res = await ecLib.ecAdd(x1, z1, 0, 0, a, pp)
      const sumX = res[0]
      const sumZ = res[1]
      assert.equal(sumX.toString(10), x1.toString())
      assert.equal(sumZ.toString(10), z1.toString())
    })

    it("Should multiply x2 EcPoint", async () => {
      const x1 = web3.utils.toBN("0x706A46DC76DCB76798E60E6D89474788D16DC18032D268FD1A704FA6")
      const y1 = web3.utils.toBN("0x1C2B76A7BC25E7702A704FA986892849FCA629487ACF3709D2E4E8BB")
      const d = web3.utils.toBN("0x02")
      const res = await ecLib.ecMul(d, x1, y1, a, pp)
      const mulX = res[0]
      const mulZ = res[1]
      const expectedMulX = web3.utils.toBN("0xAE99FEEBB5D26945B54892092A8AEE02912930FA41CD114E40447301")
      const expectedMulY = web3.utils.toBN("0x482580A0EC5BC47E88BC8C378632CD196CB3FA058A7114EB03054C9")
      assert.equal(mulX.toString(10), expectedMulX.toString())
      assert.equal(mulZ.toString(10), expectedMulY.toString())
    })

    it("Should multiply x EcPoint", async () => {
      const x1 = web3.utils.toBN("0xB70E0CBD6BB4BF7F321390B94A03C1D356C21122343280D6115C1D21")
      const y1 = web3.utils.toBN("0xBD376388B5F723FB4C22DFE6CD4375A05A07476444D5819985007E34")
      const d = web3.utils.toBN("0x03")
      const res = await ecLib.ecMul(d, x1, y1, a, pp)
      const mulX = res[0]
      const mulZ = res[1]
      const expectedMulX = web3.utils.toBN("0xDF1B1D66A551D0D31EFF822558B9D2CC75C2180279FE0D08FD896D04")
      const expectedMulY = web3.utils.toBN("0xA3F7F03CADD0BE444C0AA56830130DDF77D317344E1AF3591981A925")
      assert.equal(mulX.toString(10), expectedMulX.toString())
      assert.equal(mulZ.toString(10), expectedMulY.toString())
    })
    it("Should multiply small scalar with EcPoint", async () => {
      const x1 = web3.utils.toBN("0xB70E0CBD6BB4BF7F321390B94A03C1D356C21122343280D6115C1D21")
      const y1 = web3.utils.toBN("0xBD376388B5F723FB4C22DFE6CD4375A05A07476444D5819985007E34")
      const res = await ecLib.ecMul(0x04, x1, y1, a, pp)
      const mulX = res[0]
      const mulZ = res[1]
      const expectedMulX = web3.utils.toBN("0xAE99FEEBB5D26945B54892092A8AEE02912930FA41CD114E40447301")
      const expectedMulY = web3.utils.toBN("0x482580A0EC5BC47E88BC8C378632CD196CB3FA058A7114EB03054C9")
      assert.equal(mulX.toString(10), expectedMulX.toString())
      assert.equal(mulZ.toString(10), expectedMulY.toString())
    })
    it("Should multiply big scalar with EcPoint", async () => {
      const x1 = web3.utils.toBN("0xB70E0CBD6BB4BF7F321390B94A03C1D356C21122343280D6115C1D21")
      const y1 = web3.utils.toBN("0xBD376388B5F723FB4C22DFE6CD4375A05A07476444D5819985007E34")
      const d = web3.utils.toBN("0x159D893D4CDD747246CDCA43590E13")
      const res = await ecLib.ecMul(d, x1, y1, a, pp)
      const mulX = res[0]
      const mulZ = res[1]
      const expectedMulX = web3.utils.toBN("0x29895F0AF496BFC62B6EF8D8A65C88C613949B03668AAB4F0429E35")
      const expectedMulY = web3.utils.toBN("0x3EA6E53F9A841F2019EC24BDE1A75677AA9B5902E61081C01064DE93")
      assert.equal(mulX.toString(10), expectedMulX.toString())
      assert.equal(mulZ.toString(10), expectedMulY.toString())
    })
  })
})
