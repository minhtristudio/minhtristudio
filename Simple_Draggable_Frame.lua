-- Simple Draggable Frame Example
-- Ví dụ đơn giản về frame có thể kéo thả

local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- Tạo ScreenGui
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "DraggableExample"
screenGui.Parent = playerGui

-- Tạo Frame chính
local mainFrame = Instance.new("Frame")
mainFrame.Name = "MainFrame"
mainFrame.Size = UDim2.new(0, 300, 0, 200)
mainFrame.Position = UDim2.new(0.5, -150, 0.5, -100) -- Giữa màn hình
mainFrame.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
mainFrame.BorderSizePixel = 2
mainFrame.BorderColor3 = Color3.fromRGB(255, 255, 255)
mainFrame.Parent = screenGui

-- Tạo UICorner để làm tròn góc
local uiCorner = Instance.new("UICorner")
uiCorner.CornerRadius = UDim.new(0, 10)
uiCorner.Parent = mainFrame

-- Tạo tiêu đề
local titleLabel = Instance.new("TextLabel")
titleLabel.Name = "Title"
titleLabel.Size = UDim2.new(1, 0, 0, 30)
titleLabel.Position = UDim2.new(0, 0, 0, 0)
titleLabel.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
titleLabel.BorderSizePixel = 0
titleLabel.Text = "Draggable Frame Example"
titleLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
titleLabel.TextScaled = true
titleLabel.Font = Enum.Font.GothamBold
titleLabel.Parent = mainFrame

-- UICorner cho title
local titleCorner = Instance.new("UICorner")
titleCorner.CornerRadius = UDim.new(0, 10)
titleCorner.Parent = titleLabel

-- Tạo UIDragDetector (Phương pháp mới - Roblox Modern)
local dragDetector = Instance.new("UIDragDetector")
dragDetector.Parent = mainFrame

-- Cấu hình UIDragDetector
dragDetector.ApplyAtCenter = true
dragDetector.BoundingBehavior = Enum.BoundingBehavior.NoRecloning

-- Tạo nội dung trong frame
local contentLabel = Instance.new("TextLabel")
contentLabel.Name = "Content"
contentLabel.Size = UDim2.new(1, -20, 1, -50)
contentLabel.Position = UDim2.new(0, 10, 0, 40)
contentLabel.BackgroundTransparency = 1
contentLabel.Text = "Đây là frame có thể kéo thả!\n\nClick và kéo để di chuyển frame này.\n\nSử dụng UIDragDetector"
contentLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
contentLabel.TextScaled = true
contentLabel.Font = Enum.Font.Gotham
contentLabel.TextWrapped = true
contentLabel.Parent = mainFrame

-- Thêm hiệu ứng hover
mainFrame.MouseEnter:Connect(function()
    mainFrame.BorderColor3 = Color3.fromRGB(0, 255, 0)
end)

mainFrame.MouseLeave:Connect(function()
    mainFrame.BorderColor3 = Color3.fromRGB(255, 255, 255)
end)

print("Simple Draggable Frame created!")