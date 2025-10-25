import { useState } from "react"

function IndexPopup() {
  const [text, setText] = useState("")
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const summarizeText = async () => {
    if (!text.trim()) {
      setError("Please enter some text to summarize")
      return
    }

    setLoading(true)
    setError("")
    setSummary("")

    try {
      // Using OpenAI API - you'll need to add your API key
      const apiKey = process.env.PLASMO_PUBLIC_OPENAI_API_KEY

      if (!apiKey) {
        throw new Error(
          "API key not found. Please add PLASMO_PUBLIC_OPENAI_API_KEY to your .env file"
        )
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gemini 2.5 flash",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful assistant that summarizes text concisely."
              },
              {
                role: "user",
                content: `Please summarize the following text in 2-3 sentences:\n\n${text}`
              }
            ],
            max_tokens: 150,
            temperature: 0.7
          })
        }
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setSummary(data.choices[0].message.content)
    } catch (err) {
      setError(err.message || "Failed to summarize text")
    } finally {
      setLoading(false)
    }
  }

  const getSelectedText = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection()?.toString() || ""
      })

      if (result[0]?.result) {
        setText(result[0].result)
      }
    } catch (err) {
      setError("Failed to get selected text")
    }
  }

  return (
    <div
      style={{
        width: "400px",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}>
      <h2 style={{ margin: "0 0 16px 0", fontSize: "20px" }}>
        AI Text Summarizer
      </h2>

      <button
        onClick={getSelectedText}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "12px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px"
        }}>
        Get Selected Text from Page
      </button>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type text here to summarize..."
        rows={8}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "12px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          fontSize: "14px",
          resize: "vertical",
          boxSizing: "border-box"
        }}
      />

      <button
        onClick={summarizeText}
        disabled={loading || !text.trim()}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: loading ? "#ccc" : "#2196F3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "14px",
          fontWeight: "500"
        }}>
        {loading ? "Summarizing..." : "Summarize"}
      </button>

      {error && (
        <div
          style={{
            marginTop: "12px",
            padding: "10px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "4px",
            fontSize: "13px"
          }}>
          {error}
        </div>
      )}

      {summary && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
            borderLeft: "3px solid #2196F3"
          }}>
          <strong style={{ fontSize: "13px", color: "#555" }}>Summary:</strong>
          <p
            style={{
              margin: "8px 0 0 0",
              fontSize: "14px",
              lineHeight: "1.5"
            }}>
            {summary}
          </p>
        </div>
      )}
    </div>
  )
}

export default IndexPopup
