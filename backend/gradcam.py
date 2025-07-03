import torch
import torchvision.models as models
import torchvision.transforms as transforms
import cv2
import numpy as np
from PIL import Image

# Load model once globally
model = models.vgg16(weights=models.VGG16_Weights.IMAGENET1K_V1)
model.eval()

# Grad-CAM target layer
target_layer = model.features[29]
gradients = None
activations = None

def save_gradient_hook(module, grad_input, grad_output):
    global gradients
    gradients = grad_output[0]

def save_activation_hook(module, input, output):
    global activations
    activations = output

target_layer.register_forward_hook(save_activation_hook)
target_layer.register_backward_hook(save_gradient_hook)

# Load class labels
with open("imagenet_classes.txt", "r") as f:
    categories = [s.strip() for s in f.readlines()]

# Main Grad-CAM function
def generate_heatmap(img_path, output_path="static/heatmap.jpg"):
    preprocess = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])
    
    original_image = Image.open(img_path).convert('RGB')
    input_tensor = preprocess(original_image).unsqueeze(0)

    # Forward pass
    output = model(input_tensor)
    pred_class = output.argmax().item()
    pred_label = categories[pred_class]

    # Backward
    model.zero_grad()
    output[0, pred_class].backward()

    # Grad-CAM
    weights = torch.mean(gradients, dim=[2, 3])[0]
    cam = torch.zeros(activations.shape[2:], dtype=torch.float32)

    for i, w in enumerate(weights):
        cam += w * activations[0, i, :, :]

    cam = torch.clamp(cam, min=0)
    cam = cam / cam.max()
    cam = cam.detach().numpy()

    # Create heatmap overlay
    heatmap = cv2.resize(cam, (224, 224))
    heatmap = cv2.applyColorMap(np.uint8(255 * heatmap), cv2.COLORMAP_JET)
    original_img = cv2.cvtColor(np.array(original_image.resize((224, 224))), cv2.COLOR_RGB2BGR)
    overlay = heatmap * 0.4 + original_img * 0.6

    # Save result
    cv2.imwrite(output_path, np.uint8(overlay))
    return pred_label
