-- RoClothes2 Mobile Modern Patch using NewDragger
-- Place this script BELOW the existing RoClothes2.txt source or execute it after RoClothes has loaded.
-- It will automatically hide the old UI and spawn a simplified, draggable interface optimised for mobile.

do
    local Players = game:GetService("Players")
    local player = Players.LocalPlayer or Players:GetPropertyChangedSignal("LocalPlayer"):Wait() and Players.LocalPlayer
    local gui = player:WaitForChild("PlayerGui")

    -- Hide legacy GUI
    local old = gui:FindFirstChild("RoClothes")
    if old then old.Enabled = false end
    local oldBtn = gui:FindFirstChild("RoClothesCloseButton")
    if oldBtn then oldBtn.Enabled = false end

    -- Modern GUI
    local modern = Instance.new("ScreenGui")
    modern.Name = "RoClothesModern"
    modern.ResetOnSpawn = false
    modern.IgnoreGuiInset = true
    modern.Parent = gui

    -- Main Frame
    local frame = Instance.new("Frame")
    frame.Size = UDim2.new(0, 340, 0, 420)
    frame.Position = UDim2.new(0.5, -170, 0.5, -210)
    frame.BackgroundColor3 = Color3.fromRGB(35, 35, 35)
    frame.Parent = modern
    Instance.new("UICorner", frame).CornerRadius = UDim.new(0, 12)

    -- Dragger (UIDragDetector) inspired by NewDragger
    local drag = Instance.new("UIDragDetector")
    drag.Parent = frame
    drag.ApplyAtCenter = true

    -- Header Bar
    local header = Instance.new("TextLabel", frame)
    header.Size = UDim2.new(1, 0, 0, 36)
    header.BackgroundColor3 = Color3.fromRGB(25, 25, 25)
    header.Text = "RoClothes Modern"
    header.TextColor3 = Color3.new(1, 1, 1)
    header.TextScaled = true
    header.Font = Enum.Font.GothamBold
    Instance.new("UICorner", header).CornerRadius = UDim.new(0, 12)

    -- Close Button
    local close = Instance.new("TextButton", header)
    close.Size = UDim2.new(0, 24, 0, 24)
    close.Position = UDim2.new(1, -30, 0, 6)
    close.BackgroundTransparency = 1
    close.Text = "✕"
    close.TextColor3 = Color3.new(1, 1, 1)
    close.TextScaled = true
    close.Font = Enum.Font.GothamBold
    close.MouseButton1Click:Connect(function()
        modern.Enabled = false
        if old then old.Enabled = true end
        if oldBtn then oldBtn.Enabled = true end
    end)

    -- Content Area
    local content = Instance.new("ScrollingFrame", frame)
    content.Size = UDim2.new(1, -20, 1, -56)
    content.Position = UDim2.new(0, 10, 0, 46)
    content.BackgroundTransparency = 1
    content.ScrollBarThickness = 6

    local layout = Instance.new("UIListLayout", content)
    layout.Padding = UDim.new(0, 6)

    local function add(text, cb)
        local b = Instance.new("TextButton", content)
        b.Size = UDim2.new(1, 0, 0, 36)
        b.BackgroundColor3 = Color3.fromRGB(45, 45, 45)
        b.Text = text
        b.TextColor3 = Color3.new(1, 1, 1)
        b.TextScaled = true
        b.Font = Enum.Font.Gotham
        Instance.new("UICorner", b).CornerRadius = UDim.new(0, 8)
        b.MouseButton1Click:Connect(cb)
    end

    add("Open Legacy UI", function()
        if old then old.Enabled = true end
        if oldBtn then oldBtn.Enabled = true end
    end)

    add("Destroy Legacy UI", function()
        if old then old:Destroy() end
        if oldBtn then oldBtn:Destroy() end
    end)
end