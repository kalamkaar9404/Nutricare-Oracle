# 🏥 NutriCare-Oracle

**Privacy-Preserving Medical Locker with On-Device AI + Medical Integrity**

A  mobile application that combines:
- 🧠 **On-Device AI**: MedGemma-1.5-4b-it via Melange Framework
- 🔒 **Privacy-First**: Local PII redaction before any processing
- 🔗 **Blockchain Integrity**: Polygon Layer 2 for tamper-proof verification
- 📱 **Cross-Platform**: React Native for Android & iOS


✅ **Use of On-Device AI**: Melange framework with MedGemma for NPU-accelerated inference  
✅ **Technical Implementation**: Privacy layer + AI + Blockchain integration  
✅ **Creativity**: Novel combination of medical AI with blockchain integrity  
✅ **Demo Clarity**: Clear 3-tab interface showing the complete workflow  

## 🚀 Quick Start 

### Step 1: Deploy MedGemma to Melange (30 mins)

**CRITICAL: This is your core AI engine!**

1. **Go to Melange Dashboard**: https://mlange.zetic.ai

2. **Upload MedGemma Model**:
   - Navigate to "Deploy Your Model"
   - Model source: Hugging Face
   - Model name: `google/medgemma-1.5-4b-it`
   - Click "Upload & Auto-Compile"

3. **Get Your Keys**:
   - After compilation, you'll receive:
     - **Personal Key**: Your authentication token
     - **Model Key**: Unique identifier for MedGemma
   - Copy these keys!

4. **Configure the App**:
   - Open `src/services/MelangeService.ts`
   - Replace placeholders:
     ```typescript
     personalKey: 'YOUR_MELANGE_PERSONAL_KEY',  // From dashboard
     modelKey: 'YOUR_MEDGEMMA_MODEL_KEY',       // From dashboard
     ```

### Step 3: Integrate Melange Native SDK

#### For Android:

1. **Add Melange Dependency** in `android/app/build.gradle`:
   ```gradle
   dependencies {
       implementation 'com.zeticai.mlange:mlange:+'
   }
   ```

2. **Create Native Module** `android/app/src/main/java/com/nutricare/MelangeModule.java`:
   ```java
   import com.zeticai.mlange.core.model.ZeticMLangeModel;
   import com.zeticai.mlange.core.tensor.Tensor;
   
   public class MelangeModule extends ReactContextBaseJavaModule {
       private ZeticMLangeModel model;
       
       @ReactMethod
       public void initializeModel(String personalKey, String modelName, Promise promise) {
           try {
               model = new ZeticMLangeModel(
                   getReactApplicationContext(),
                   personalKey,
                   modelName
               );
               promise.resolve("Model initialized");
           } catch (Exception e) {
               promise.reject("INIT_ERROR", e);
           }
       }
       
       @ReactMethod
       public void runInference(String input, Promise promise) {
           // Prepare input tensors
           Tensor[] inputs = prepareInputs(input);
           
           // Run inference on NPU
           Tensor[] outputs = model.run(inputs);
           
           // Parse outputs
           String result = parseOutputs(outputs);
           promise.resolve(result);
       }
   }
   ```

#### For iOS:

1. **Add Melange Package** via Swift Package Manager:
   - URL: `https://github.com/zetic-ai/ZeticMLangeiOS.git`

2. **Create Native Module** `ios/MelangeModule.swift`:
   ```swift
   import ZeticMLange
   
   @objc(MelangeModule)
   class MelangeModule: NSObject {
       var model: ZeticMLangeModel?
       
       @objc
       func initializeModel(_ personalKey: String, modelName: String, 
                           resolver: @escaping RCTPromiseResolveBlock,
                           rejecter: @escaping RCTPromiseRejectBlock) {
           do {
               model = try ZeticMLangeModel(
                   tokenKey: personalKey,
                   name: modelName,
                   version: 1
               )
               resolver("Model initialized")
           } catch {
               rejecter("INIT_ERROR", error.localizedDescription, error)
           }
       }
       
       @objc
       func runInference(_ input: String,
                        resolver: @escaping RCTPromiseResolveBlock,
                        rejecter: @escaping RCTPromiseRejectBlock) {
           // Prepare inputs
           let inputs = prepareInputs(input)
           
           // Run inference on Neural Engine
           let outputs = try! model!.run(inputs: inputs)
           
           // Parse outputs
           let result = parseOutputs(outputs)
           resolver(result)
       }
   }
   ```

### Step 4: Deploy Smart Contract (30 mins)

1. **Install Hardhat**:
   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   npx hardhat init
   ```

2. **Configure Polygon Amoy** in `hardhat.config.js`:
   ```javascript
   module.exports = {
     networks: {
       polygonAmoy: {
         url: "https://rpc-amoy.polygon.technology",
         accounts: [process.env.PRIVATE_KEY]
       }
     }
   };
   ```

3. **Deploy Contract**:
   ```bash
   npx hardhat run scripts/deploy.js --network polygonAmoy
   ```

4. **Update Contract Address** in `src/services/BlockchainService.ts`:
   ```typescript
   private readonly CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_CONTRACT_ADDRESS';
   ```

### Step 5: Run the App


## 📱 Demo Workflow

### Tab 1: 📋 Scan
1. Paste sample medical report with PII
2. Click "Process with Privacy + AI"
3. **Show**: PII redaction happening locally
4. **Show**: Processing time (on-device inference)

### Tab 2: 🧠 Insights
1. **Show**: Health insights generated by MedGemma
2. **Show**: Processing time (should be <2000ms on modern devices)
3. **Show**: Recommendations and risk factors
4. **Highlight**: "Generated on-device using MedGemma via Melange"

### Tab 3: 🔗 Verify
1. Click "Verify Integrity"
2. **Show**: Hash verification against Polygon blockchain
3. **Show**: Timestamp and transaction details
4. **Explain**: No sensitive data on blockchain, only hashes


## 🏗️ Architecture

```
Camera/Input → Privacy Layer → Melange/MedGemma/LLama Vision/Whisper → Local Storage → Blockchain Anchor
     ↓              ↓                ↓                  ↓              ↓
  Medical      PII Redaction    AI Inference      Encryption      Hash Storage
   Report      (Local Only)    (On-Device NPU)   (AES-256)      (Polygon L2)
```

## 🔑 Key Technical Innovations

1. **Melange Integration**: Automated NPU utilization for 4B parameter model
2. **Privacy-First**: Multi-layer PII detection before any processing
3. **Documents Anchoring**: Lightweight integrity verification without data exposure
4. **Mobile-Optimized**: Thermal management and memory optimization


## 📚 Resources

- **Melange Docs**: https://docs.zetic.ai/
- **MedGemma Model**: https://huggingface.co/google/medgemma-1.5-4b-it
- **Melange Examples**: https://github.com/zetic-ai/ZETIC_Melange_apps
- **Polygon Amoy**: https://polygon.technology/

## 🎯 Next Steps (Post-Hackathon)

1. Integrate actual camera OCR for medical reports
2. Add nutritional database for food tracking
3. Implement biometric authentication
4. Deploy to production with mainnet blockchain
5. Add multi-language support
6. Implement data export for doctor consultations

## 📄 License

MIT License - Built for hackathon demonstration

## 🙏 Acknowledgments

- **Melange** by ZETIC.ai for on-device AI infrastructure
- **MedGemma** by Google for medical AI capabilities
- **Polygon** for scalable blockchain infrastructure

---

**Built with ❤️ for the Melange Hackathon**

*Demonstrating the future of privacy-preserving healthcare technology*
