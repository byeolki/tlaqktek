from transformers import AutoModelForCausalLM, AutoTokenizer
from typing import List, Dict

class Exaone:
    def __init__(self):
        self.model_name = "mlx-community/exaone-4.0-1.2b-4bit"
        self._model = None
        self._tokenizer = None

    @property
    def model(self):
        if self._model is None:
            self._load_model()
        return self._model

    @property
    def tokenizer(self):
        if self._tokenizer is None:
            self._load_tokenizer()
        return self._tokenizer

    def _load_model(self):
        try:
            self._model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype="bfloat16",
                device_map="auto"
            )
        except Exception as e:
            raise RuntimeError(f"Model loading failed: {e}")

    def _load_tokenizer(self):
        try:
            self._tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        except Exception as e:
            raise RuntimeError(f"Tokenizer loading failed: {e}")

    def generate(self, messages: List[Dict[str, str]], max_length: int = 100) -> str:
        if not messages:
            raise ValueError("Messages list cannot be empty")

        try:
            input_ids = self._tokenize_messages(messages)

            output = self.model.generate(
                input_ids.to(self.model.device),
                max_new_tokens=max_length,
                do_sample=True,
                temperature=0.7,
                top_p=0.95
            )

            return self.tokenizer.decode(output[0])

        except Exception as e:
            raise RuntimeError(f"Text generation failed: {e}")

    def _tokenize_messages(self, messages: List[Dict[str, str]]):
        try:
            return self.tokenizer.apply_chat_template(
                messages,
                tokenize=True,
                add_generation_prompt=True,
                return_tensors="pt",
                enable_thinking=True
            )
        except Exception as e:
            raise ValueError(f"Invalid message format: {e}")

    def cleanup(self):
        if self._model is not None:
            del self._model
            self._model = None
        if self._tokenizer is not None:
            del self._tokenizer
            self._tokenizer = None
