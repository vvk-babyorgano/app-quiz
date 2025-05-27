import {
  Page,
  Layout,
  Card,
  Text,
  TextField,
  Select,
  Button,
  Divider,
  InlineStack,
  BlockStack,
  Icon,
  Box,
} from "@shopify/polaris";
import { DeleteIcon, EditIcon } from "@shopify/polaris-icons"; // Polaris v12+
import { useState, useEffect } from "react";

export default function QuizAdminPage() {
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("SINGLE");
  const [options, setOptions] = useState([{ text: "", productIds: "" }]);
  const [status, setStatus] = useState("");
  const [questions, setQuestions] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const res = await fetch("/api/questions");
    const data = await res.json();
    setQuestions(Array.isArray(data) ? data : []);
  };

  const resetForm = () => {
    setQuestionText("");
    setQuestionType("SINGLE");
    setOptions([{ text: "", productIds: "" }]);
    setEditId(null);
    setStatus("");
  };

  const saveQuestion = async () => {
    const payload = {
      text: questionText,
      type: questionType,
      options: options.map((o) => ({
        text: o.text,
        productIds: o.productIds.split(",").map((id) => id.trim()),
      })),
    };

    const response = await fetch(
      editId ? `/api/questions/${editId}` : "/api/questions",
      {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      setStatus(editId ? "Question updated!" : "Question saved!");
      resetForm();
      fetchQuestions();
    } else {
      setStatus("Error saving question");
    }
  };

  const handleEdit = (q) => {
    setEditId(q.id);
    setQuestionText(q.text);
    setQuestionType(q.type);
    setOptions(
      q.options.map((opt) => ({
        text: opt.text,
        productIds: opt.productIds.join(", "),
      }))
    );
  };

  const handleDelete = async (id) => {
    await fetch(`/api/questions/${id}`, { method: "DELETE" });
    fetchQuestions();
  };

  const handleOptionChange = (index, field, value) => {
    const updated = [...options];
    updated[index][field] = value;
    setOptions(updated);
  };

  const addOption = () => {
    setOptions([...options, { text: "", productIds: "" }]);
  };

  const removeOption = (index) => {
    const updated = [...options];
    updated.splice(index, 1);
    setOptions(updated);
  };

  return (
    <Page title="Quiz Question Manager">
      <Layout>
        <Layout.Section>
          <Card padding="400">
            <BlockStack gap="400">
              <Text variant="headingLg">{editId ? "Edit Question" : "New Question"}</Text>

              <TextField
                label="Question"
                value={questionText}
                onChange={setQuestionText}
                autoComplete="off"
              />

              <Select
                label="Type"
                options={[
                  { label: "Single Choice", value: "SINGLE" },
                  { label: "Multiple Choice", value: "MULTIPLE" },
                ]}
                value={questionType}
                onChange={setQuestionType}
              />

              <Divider />

              <BlockStack gap="300">
                <Text variant="headingSm">Options</Text>
                {options.map((opt, index) => (
                  <InlineStack key={index} gap="200" wrap>
                    <TextField
                      label={`Option ${index + 1}`}
                      value={opt.text}
                      onChange={(val) => handleOptionChange(index, "text", val)}
                      autoComplete="off"
                    />
                    <TextField
                      label="Product IDs"
                      value={opt.productIds}
                      onChange={(val) => handleOptionChange(index, "productIds", val)}
                      autoComplete="off"
                    />
                    {options.length > 1 && (
                      <Button
                        onClick={() => removeOption(index)}
                        tone="critical"
                        variant="tertiary"
                        icon={DeleteIcon}
                      />
                    )}
                  </InlineStack>
                ))}
              </BlockStack>

              <Button variant="secondary" onClick={addOption}>
                + Add Option
              </Button>

              <Divider />

              <InlineStack gap="300">
                <Button variant="primary" onClick={saveQuestion}>
                  {editId ? "Update Question" : "Save Question"}
                </Button>
                <Button onClick={resetForm} variant="tertiary">
                  Reset
                </Button>
              </InlineStack>

              {status && <Text tone="success">{status}</Text>}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card padding="400">
            <Text variant="headingMd">Existing Questions</Text>
            {questions.length === 0 ? (
              <Text tone="subdued">No questions found.</Text>
            ) : (
              <BlockStack gap="300">
                {questions.map((q) => (
                  <Box
                    key={q.id}
                    border="base"
                    padding="300"
                    borderRadius="large"
                    background="bg-subdued"
                  >
                    <Text fontWeight="bold">{q.text}</Text>
                    <Text tone="subdued">Type: {q.type}</Text>
                    <Text>Options:</Text>
                    <ul style={{ paddingLeft: "1rem" }}>
                      {q.options.map((opt, idx) => (
                        <li key={idx}>{opt.text}</li>
                      ))}
                    </ul>
                    <InlineStack gap="200" wrap={false}>
                      <Button
                        icon={EditIcon}
                        variant="tertiary"
                        onClick={() => handleEdit(q)}
                      >
                        Edit
                      </Button>
                      <Button
                        icon={DeleteIcon}
                        variant="tertiary"
                        tone="critical"
                        onClick={() => handleDelete(q.id)}
                      >
                        Delete
                      </Button>
                    </InlineStack>
                  </Box>
                ))}
              </BlockStack>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
