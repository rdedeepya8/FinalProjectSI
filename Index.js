const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
/* swagger Info */
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  swaggerDefinition: {
    info: {
      title: "Swagger Final Project",
      version: "1.0.0",
      description: "Final project using Text Analytics from Azure",
      contact: {
        name: "Dedeepya Ramineni",
        url: "https://github.com/rdedeepya8",
        email: "draminen@uncc.edu",
      },
    },
    host: ":3000",
    basePath: "/",
  },
  apis: ["./index.js"],
};

const specs = swaggerJsDoc(options);
const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const {
  TextAnalyticsClient,
  AzureKeyCredential,
} = require("@azure/ai-text-analytics");
const { get } = require("express/lib/response");

const API_KEY = process.env.API_KEY;
const endpoint = "https://dedeepyasi.cognitiveservices.azure.com/";
const textAnalyticsClient = new TextAnalyticsClient(endpoint,  new AzureKeyCredential(API_KEY));

/**
 * @swagger
 * /entity:
 *   post:
 *     tags:
 *       - Entity Recognition
 *     description: Calls the Entitiy Recognition API from Azure 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Input to send to NER API in Azure.
 *         in: body
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: string
 *           example: {"inputText":[
    "Microsoft was founded by Bill Gates and Paul Allen on April 4, 1975, to develop and sell BASIC interpreters for the Altair 8800",
    "La sede principal de Microsoft se encuentra en la ciudad de Redmond, a 21 kilómetros de Seattle.",
    "Hi this is Dedeepya",
    "Seattle is a beautiful palce to visit",
    "Power people will make places powerful"]}
 *     responses:
 *       200:
 *         description: Successfully retrieved
 */
app.post("/entity", async (req, res) => {
    let entityInputs = req.body.inputText;
    const entityResults = await textAnalyticsClient.recognizeEntities(entityInputs);
    res.json(entityResults);

})
/**
 * @swagger
 * /Key_phrase:
 *   post:
 *     tags:
 *       - Key_phrase
 *     description: Calls the Entitiy Recognition API from Azure 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Input to send to NER API in Azure.
 *         in: body
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: string
 *           example: {"KeyphraseText":["My cat might need to see a veterinarian."]}
 *     responses:
 *       200:
 *         description: Successfully retrieved
 */
app.post("/Key_phrase", async (req, res) => {
    let KeyphraseInputs = req.body.KeyphraseText;
    const keyResults = await textAnalyticsClient.recognizeEntities(KeyphraseInputs);
    res.json(keyResults);

})
 
/**
 * @swagger
 * /PII:
 *   post:
 *     tags:
 *       - PII
 *     description: Calls the Entitiy Recognition API from Azure 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Input to send to NER API in Azure.
 *         in: body
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: string
 *           example: {"PIIText":["The employee's phone number is (555) 555-5555."]}
 *     responses:
 *       200:
 *         description: Successfully retrieved
 */
app.post("/PII", async (req, res) => {
    let PIIInputs = req.body.PIIText;
    const PIIresults = await textAnalyticsClient.recognizePiiEntities(PIIInputs, "en");
    for (const result of PIIresults) {
        if (result.error === undefined) {
            console.log("Redacted Text: ", result.redactedText);
            console.log(" -- Recognized PII entities for input", result.id, "--");
            for (const entity of result.entities) {
                console.log(entity.text, ":", entity.category, "(Score:", entity.confidenceScore, ")");
            }
        } else {
            console.error("Encountered an error:", result.error);
        }
    }
    res.json(PIIresults);

})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`)); 