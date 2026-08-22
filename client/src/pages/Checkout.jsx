import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";

// Full Q&A — sent to the AI, which needs the question context to generate well.
function compileFullPrompt(questions, answers) {
  return questions.map((q, i) => `${q} ${answers[i]?.trim()}`).join(" ");
}

// Answers only, no question text — this is what gets shown on the shareable image.
function compileAnswersOnly(answers) {
  return answers.map((a) => a?.trim()).filter(Boolean).join(" • ");
}

function QuestionWizard({ product, onComplete }) {
  const questions = product.promptQuestions?.length === 5
    ? product.promptQuestions
    : ["Tell us what you'd like generated.", "", "", "", ""].slice(0, 1);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [done, setDone] = useState(false);

  const current = answers[step] || "";
  const canAdvance = current.trim().length >= 2;

  const next = () => {
    if (!canAdvance) return;
    if (step === questions.length - 1) {
      const fullPrompt = compileFullPrompt(questions, answers);
      const promptSummary = compileAnswersOnly(answers);
      setDone(true);
      onComplete(fullPrompt, promptSummary);
    } else {
      setStep((s) => s + 1);
    }
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const editAgain = () => {
    setDone(false);
    setStep(0);
  };

  if (done) {
    return (
      <div className="bg-cream/40 border border-blue rounded-lg p-4 text-sm space-y-2">
        <p className="text-blue font-semibold">✓ Your answers are ready to generate from.</p>
        <button type="button" onClick={editAgain} className="text-orange font-semibold hover:underline">
          Edit answers
        </button>
      </div>
    );
  }

  return (
    <div className="bg-cream/40 border border-blue rounded-lg p-4 space-y-3">
      <div className="flex gap-1.5">
        {questions.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-orange" : "bg-blue/30"}`}
          />
        ))}
      </div>
      <p className="text-xs text-ink/50">Question {step + 1} of {questions.length}</p>
      <p className="font-semibold text-ink">{questions[step]}</p>
      <textarea
        value={current}
        onChange={(e) => {
          const next = [...answers];
          next[step] = e.target.value;
          setAnswers(next);
        }}
        rows={2}
        className="w-full border border-blue rounded-lg p-3 text-sm"
        placeholder="Type your answer…"
      />
      <div className="flex justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="text-sm text-ink/50 font-semibold disabled:opacity-30"
        >
          Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canAdvance}
          className="bg-orange text-cream px-5 py-2 rounded-full text-sm font-semibold disabled:opacity-40"
        >
          {step === questions.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [answers, setAnswers] = useState({}); // { [productId]: { prompt, promptSummary } }
  const navigate = useNavigate();

  const loadCart = () => api.get("/cart").then(({ data }) => setCart(data));
  useEffect(() => { loadCart(); }, []);

  const total = cart.reduce((sum, i) => sum + i.productId.coinPrice, 0);
  const allReady = cart.length > 0 && cart.every((item) => !!answers[item.productId._id]);

  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);
      await loadCart();
      setAnswers((p) => {
        const next = { ...p };
        delete next[productId];
        return next;
      });
    } catch (err) {
      alert(err.response?.data?.error || "Couldn't remove item");
    }
  };

  const submit = async () => {
    const items = cart.map((i) => ({
      productId: i.productId._id,
      prompt: answers[i.productId._id]?.prompt || "",
      promptSummary: answers[i.productId._id]?.promptSummary || "",
    }));
    try {
      await api.post("/checkout", { items });
      navigate("/profile");
    } catch (err) {
      alert(err.response?.data?.error || "Checkout failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-orange">Checkout</h1>
      <p className="text-ink/60 text-sm -mt-4">
        Answer a few quick questions for each item — your answers become the basis for what gets generated.
      </p>

      {cart.map((item) => (
        <div key={item._id} className="bg-white rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold">{item.productId.title}</span>
            <div className="flex items-center gap-3">
              <span>{item.productId.coinPrice} coins</span>
              <button
                onClick={() => removeItem(item.productId._id)}
                className="text-sm text-orange font-semibold hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
          <QuestionWizard
            product={item.productId}
            onComplete={(prompt, promptSummary) =>
              setAnswers((p) => ({ ...p, [item.productId._id]: { prompt, promptSummary } }))
            }
          />
        </div>
      ))}
      {cart.length === 0 && <p className="text-ink/50 text-sm">Your cart is empty.</p>}

      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>{total} coins</span>
      </div>
      <button
        onClick={submit}
        disabled={!allReady}
        className="w-full bg-ink text-cream py-3 rounded-full font-semibold disabled:opacity-40"
      >
        {allReady ? "Confirm & Generate" : "Answer all questions to continue"}
      </button>
    </div>
  );
}