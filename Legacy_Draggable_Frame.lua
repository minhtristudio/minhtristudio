-- Legacy Draggable Frame Example
-- Ví dụ frame có thể kéo thả sử dụng phương pháp truyền thống

local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local RunService = game:GetService("RunService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")
local mouse = player:GetMouse()

-- Tạo ScreenGui
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "LegacyDraggableExample"
screenGui.Parent = playerGui

-- Tạo Frame chính
local mainFrame = Instance.new("Frame")
mainFrame.Name = "MainFrame"
mainFrame.Size = UDim2.new(0, 350, 0, 250)
mainFrame.Position = UDim2.new(0.5, -175, 0.5, -125)
mainFrame.BackgroundColor3 = Color3.fromRGB(45, 45, 45)
mainFrame.BorderSizePixel = 1
mainFrame.BorderColor3 = Color3.fromRGB(100, 100, 100)
mainFrame.Parent = screenGui

-- Tạo UICorner
local mainCorner = Instance.new("UICorner")
mainCorner.CornerRadius = UDim.new(0, 8)
mainCorner.Parent = mainFrame

-- Tạo Title Bar (để kéo thả)
local titleBar = Instance.new("Frame")
titleBar.Name = "TitleBar"
titleBar.Size = UDim2.new(1, 0, 0, 35)
titleBar.Position = UDim2.new(0, 0, 0, 0)
titleBar.BackgroundColor3 = Color3.fromRGB(25, 25, 25)
titleBar.BorderSizePixel = 0
titleBar.Parent = mainFrame

local titleCorner = Instance.new("UICorner")
titleCorner.CornerRadius = UDim.new(0, 8)
titleCorner.Parent = titleBar

-- Title Text
local titleText = Instance.new("TextLabel")
titleText.Name = "TitleText"
titleText.Size = UDim2.new(1, -40, 1, 0)
titleText.Position = UDim2.new(0, 10, 0, 0)
titleText.BackgroundTransparency = 1
titleText.Text = "🎮 Legacy Draggable Frame"
titleText.TextColor3 = Color3.fromRGB(255, 255, 255)
titleText.TextScaled = true
titleText.Font = Enum.Font.GothamBold
titleText.TextXAlignment = Enum.TextXAlignment.Left
titleText.Parent = titleBar

-- Close Button
local closeButton = Instance.new("TextButton")
closeButton.Name = "CloseButton"
closeButton.Size = UDim2.new(0, 25, 0, 25)
closeButton.Position = UDim2.new(1, -30, 0, 5)
closeButton.BackgroundColor3 = Color3.fromRGB(255, 0, 0)
closeButton.BorderSizePixel = 0
closeButton.Text = "✕"
closeButton.TextColor3 = Color3.fromRGB(255, 255, 255)
closeButton.TextScaled = true
closeButton.Font = Enum.Font.GothamBold
closeButton.Parent = titleBar

local closeCorner = Instance.new("UICorner")
closeCorner.CornerRadius = UDim.new(0, 4)
closeCorner.Parent = closeButton

-- Content Area
local contentFrame = Instance.new("Frame")
contentFrame.Name = "ContentFrame"
contentFrame.Size = UDim2.new(1, -20, 1, -55)
contentFrame.Position = UDim2.new(0, 10, 0, 45)
contentFrame.BackgroundTransparency = 1
contentFrame.Parent = mainFrame

local contentText = Instance.new("TextLabel")
contentText.Name = "ContentText"
contentText.Size = UDim2.new(1, 0, 1, 0)
contentText.Position = UDim2.new(0, 0, 0, 0)
contentText.BackgroundTransparency = 1
contentText.Text = "📌 Cách sử dụng:\n\n• Click và kéo title bar để di chuyển\n• Tương thích với mọi executor\n• Sử dụng InputBegan/InputChanged\n• Hỗ trợ cả PC và Mobile\n\n🔧 Phương pháp truyền thống"
contentText.TextColor3 = Color3.fromRGB(200, 200, 200)
contentText.TextScaled = true
contentText.Font = Enum.Font.Gotham
contentText.TextWrapped = true
contentText.TextYAlignment = Enum.TextYAlignment.Top
contentText.Parent = contentFrame

-- Variables cho dragging
local dragging = false
local dragStart = nil
local startPos = nil

-- Mouse/Touch dragging functions
local function updateInput(input)
    if dragging then
        local delta = input.Position - dragStart
        mainFrame.Position = UDim2.new(
            startPos.X.Scale,
            startPos.X.Offset + delta.X,
            startPos.Y.Scale,
            startPos.Y.Offset + delta.Y
        )
    end
end

-- Touch/Click Start
titleBar.InputBegan:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseButton1 or 
       input.UserInputType == Enum.UserInputType.Touch then
        dragging = true
        dragStart = input.Position
        startPos = mainFrame.Position
        
        -- Visual feedback
        titleBar.BackgroundColor3 = Color3.fromRGB(0, 100, 200)
        
        input.Changed:Connect(function()
            if input.UserInputState == Enum.UserInputState.End then
                dragging = false
                titleBar.BackgroundColor3 = Color3.fromRGB(25, 25, 25)
            end
        end)
    end
end)

-- Mouse/Touch Move
titleBar.InputChanged:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseMovement or 
       input.UserInputType == Enum.UserInputType.Touch then
        updateInput(input)
    end
end)

-- Global input handling for mobile
UserInputService.InputChanged:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.Touch then
        updateInput(input)
    end
end)

-- Close button functionality
closeButton.MouseButton1Click:Connect(function()
    screenGui:Destroy()
end)

-- Hover effects
titleBar.MouseEnter:Connect(function()
    if not dragging then
        titleBar.BackgroundColor3 = Color3.fromRGB(35, 35, 35)
    end
end)

titleBar.MouseLeave:Connect(function()
    if not dragging then
        titleBar.BackgroundColor3 = Color3.fromRGB(25, 25, 25)
    end
end)

closeButton.MouseEnter:Connect(function()
    closeButton.BackgroundColor3 = Color3.fromRGB(255, 50, 50)
end)

closeButton.MouseLeave:Connect(function()
    closeButton.BackgroundColor3 = Color3.fromRGB(255, 0, 0)
end)

print("Legacy Draggable Frame created successfully!")