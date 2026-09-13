import unittest

from services.workflow_parser import extract_workflow_prediction


class WorkflowParserSmokeTest(unittest.TestCase):
    def test_parses_a_realistic_workflow_entry_without_fixed_output_names(self) -> None:
        workflow_entry = {
            "workflow_result": {
                "predictions": [
                    {"label": "Laptop", "score": 0.91},
                    {"label": "Phone", "score": 0.42},
                ]
            }
        }

        label, confidence = extract_workflow_prediction(workflow_entry)

        self.assertEqual(label, "Laptop")
        self.assertEqual(confidence, 0.91)


if __name__ == "__main__":
    unittest.main()
