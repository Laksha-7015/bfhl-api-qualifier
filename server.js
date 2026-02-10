const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const EMAIL = "laksha0472.be23@chitkara.edu.in";

// ---------------- Fibonacci ----------------
function fibonacci(n) {
    if (typeof n !== "number" || n < 0)
        throw new Error("Invalid Fibonacci input");

    let arr = [0, 1];
    for (let i = 2; i < n; i++) {
        arr.push(arr[i - 1] + arr[i - 2]);
    }
    return arr.slice(0, n);
}

// ---------------- Prime ----------------
function isPrime(num) {
    if (num < 2) return false;

    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

// ---------------- HCF ----------------
function hcf(arr) {
    if (!Array.isArray(arr)) throw new Error("Invalid HCF input");

    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    return arr.reduce((a, b) => gcd(a, b));
}

// ---------------- LCM ----------------
function lcm(arr) {
    if (!Array.isArray(arr)) throw new Error("Invalid LCM input");

    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const lcmTwo = (a, b) => (a * b) / gcd(a, b);

    return arr.reduce((a, b) => lcmTwo(a, b));
}

// ---------------- Ask AI----------------
async function askAI(question){
    try{
        const res = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-3.5-turbo",
                messages: [
                    { role: "user", content: question + " Answer in one word only." }
                ]
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return res.data.choices[0].message.content.trim();

    }catch(error){
        console.log(error.response?.data || error.message);
        throw new Error("AI API failed");
    }
}



// ---------------- POST /bfhl ----------------
app.post("/bfhl", async (req, res) => {
    try {
        const body = req.body;
        const keys = Object.keys(body);

        if (keys.length !== 1) {
            return res.status(400).json({
                is_success: false,
                message: "Exactly one key required"
            });
        }

        const key = keys[0];
        const value = body[key];

        let result;

        switch (key) {
            case "fibonacci":
                result = fibonacci(value);
                break;

            case "prime":
                if (!Array.isArray(value))
                    throw new Error("Prime expects array");
                result = value.filter(isPrime);
                break;

            case "hcf":
                result = hcf(value);
                break;

            case "lcm":
                result = lcm(value);
                break;

            case "AI":
                if (typeof value !== "string")
                    throw new Error("AI expects string");
                result = await askAI(value);
                break;

            default:
                throw new Error("Invalid key");
        }

        res.status(200).json({
            is_success: true,
            official_email: EMAIL,
            data: result
        });

    } catch (err) {
        res.status(400).json({
            is_success: false,
            message: err.message
        });
    }
});

// ---------------- GET /health ----------------
app.get("/health", (req, res) => {
    res.status(200).json({
        is_success: true,
        official_email: EMAIL
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));
