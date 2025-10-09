from rembg import remove
from PIL import Image
import io

async def remove_background(input_path: str, output_path: str) -> bool:
    try:
        with open(input_path, "rb") as i:
            input_data = i.read()

        output_data = remove(input_data)

        with open(output_path, "wb") as o:
            o.write(output_data)

        return True
    except Exception as e:
        print(f"Background removal failed: {e}")
        return False
