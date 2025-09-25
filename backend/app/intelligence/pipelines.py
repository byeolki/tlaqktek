from ._exaone import Exaone

class ExaonePipeline:
    def __init__(self):
        self.exaone = Exaone()

    async def generate_tag(self, item_data: dict[str, str]) -> list[str]:
        prompt = f"""
        매물명: {item_data['title']}
        매물 설명: {item_data['description']}
        매물 카테고리: {item_data['category']}
        상품 거래 방법 및 상태: {item_data['item_tags']}

        이걸 보고 상품에 대한 태그들 3~7개를 쉼표로 구분해서 작성해줘
        ex) 직거래, 택배, 편의점 택배 가능, 사용감 적음, 트레이닝 복
        """

        response = self.exaone.generate(
            messages=[
                {"role":"user", "content":prompt}
            ]
        )
        return [tag.strip() for tag in response.split(",")]
