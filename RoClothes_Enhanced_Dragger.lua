-- RoClothes Enhanced Dragger System
-- Hệ thống dragger cải tiến cho RoClothes với tương thích tốt hơn

local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- Enhanced Dragger Function
local function createEnhancedDragger(frame, titleBar)
    local dragging = false
    local dragStart = nil
    local startPos = nil
    local lastPosition = frame.Position
    
    -- Animation settings
    local smoothTween = nil
    local tweenInfo = TweenInfo.new(0.2, Enum.EasingStyle.Quart, Enum.EasingDirection.Out)
    
    -- Visual feedback
    local function setDragMode(active)
        if smoothTween then
            smoothTween:Cancel()
        end
        
        local targetProps = active and {
            BackgroundTransparency = 0.1,
            Size = frame.Size + UDim2.new(0, 2, 0, 2)
        } or {
            BackgroundTransparency = 0,
            Size = frame.Size - UDim2.new(0, 2, 0, 2)
        }
        
        smoothTween = TweenService:Create(frame, tweenInfo, targetProps)
        smoothTween:Play()
        
        -- Title bar color change
        if titleBar then
            local titleProps = active and {
                BackgroundColor3 = Color3.fromRGB(0, 150, 255)
            } or {
                BackgroundColor3 = Color3.fromRGB(54, 0, 54)
            }
            TweenService:Create(titleBar, tweenInfo, titleProps):Play()
        end
    end
    
    -- Update position function
    local function updatePosition(input)
        if dragging and dragStart then
            local delta = input.Position - dragStart
            local newPosition = UDim2.new(
                startPos.X.Scale,
                startPos.X.Offset + delta.X,
                startPos.Y.Scale,
                startPos.Y.Offset + delta.Y
            )
            
            -- Boundary checking (giữ frame trong màn hình)
            local viewportSize = workspace.CurrentCamera.ViewportSize
            local frameSize = frame.AbsoluteSize
            
            local minX = 0
            local maxX = viewportSize.X - frameSize.X
            local minY = 0
            local maxY = viewportSize.Y - frameSize.Y
            
            -- Clamp position
            local clampedX = math.clamp(newPosition.X.Offset, minX, maxX)
            local clampedY = math.clamp(newPosition.Y.Offset, minY, maxY)
            
            frame.Position = UDim2.new(0, clampedX, 0, clampedY)
            lastPosition = frame.Position
        end
    end
    
    -- Start dragging
    local function startDrag(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or 
           input.UserInputType == Enum.UserInputType.Touch then
            dragging = true
            dragStart = input.Position
            startPos = frame.Position
            
            setDragMode(true)
            
            -- Handle input end
            local connection
            connection = input.Changed:Connect(function()
                if input.UserInputState == Enum.UserInputState.End then
                    dragging = false
                    setDragMode(false)
                    connection:Disconnect()
                end
            end)
        end
    end
    
    -- Input handling
    local targetElement = titleBar or frame
    
    targetElement.InputBegan:Connect(startDrag)
    
    targetElement.InputChanged:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseMovement or 
           input.UserInputType == Enum.UserInputType.Touch then
            updatePosition(input)
        end
    end)
    
    -- Global input for mobile support
    UserInputService.InputChanged:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.Touch then
            updatePosition(input)
        end
    end)
    
    -- Smooth position restore when frame goes off-screen
    local function checkBounds()
        local viewportSize = workspace.CurrentCamera.ViewportSize
        local framePos = frame.AbsolutePosition
        local frameSize = frame.AbsoluteSize
        
        if framePos.X < -frameSize.X * 0.8 or framePos.X > viewportSize.X * 0.8 or
           framePos.Y < -frameSize.Y * 0.8 or framePos.Y > viewportSize.Y * 0.8 then
            
            -- Smooth return to last valid position
            local returnTween = TweenService:Create(frame, 
                TweenInfo.new(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
                {Position = lastPosition}
            )
            returnTween:Play()
        end
    end
    
    -- Monitor viewport changes
    workspace.CurrentCamera:GetPropertyChangedSignal("ViewportSize"):Connect(checkBounds)
    
    return {
        setDragMode = setDragMode,
        checkBounds = checkBounds,
        getPosition = function() return frame.Position end,
        setPosition = function(pos) 
            frame.Position = pos
            lastPosition = pos
        end
    }
end

-- Example usage in RoClothes style
local function createRoClothesWithEnhancedDragger()
    -- Create ScreenGui
    local screenGui = Instance.new("ScreenGui")
    screenGui.Name = "RoClothesEnhanced"
    screenGui.Parent = playerGui
    screenGui.ResetOnSpawn = false
    
    -- Main Frame
    local mainFrame = Instance.new("Frame")
    mainFrame.Name = "MainFrame"
    mainFrame.Size = UDim2.new(0, 600, 0, 450)
    mainFrame.Position = UDim2.new(0.5, -300, 0.5, -225)
    mainFrame.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
    mainFrame.BorderSizePixel = 0
    mainFrame.Parent = screenGui
    
    -- Main Frame Corner
    local mainCorner = Instance.new("UICorner")
    mainCorner.CornerRadius = UDim.new(0, 12)
    mainCorner.Parent = mainFrame
    
    -- Title Bar
    local titleBar = Instance.new("Frame")
    titleBar.Name = "TitleBar"
    titleBar.Size = UDim2.new(1, 0, 0, 40)
    titleBar.Position = UDim2.new(0, 0, 0, 0)
    titleBar.BackgroundColor3 = Color3.fromRGB(54, 0, 54)
    titleBar.BorderSizePixel = 0
    titleBar.Parent = mainFrame
    
    local titleCorner = Instance.new("UICorner")
    titleCorner.CornerRadius = UDim.new(0, 12)
    titleCorner.Parent = titleBar
    
    -- Title Gradient
    local titleGradient = Instance.new("UIGradient")
    titleGradient.Color = ColorSequence.new{
        ColorSequenceKeypoint.new(0, Color3.fromRGB(54, 0, 54)),
        ColorSequenceKeypoint.new(1, Color3.fromRGB(100, 0, 100))
    }
    titleGradient.Rotation = -90
    titleGradient.Parent = titleBar
    
    -- Title Text
    local titleText = Instance.new("TextLabel")
    titleText.Name = "TitleText"
    titleText.Size = UDim2.new(1, -50, 1, 0)
    titleText.Position = UDim2.new(0, 15, 0, 0)
    titleText.BackgroundTransparency = 1
    titleText.Text = "🎮 RoClothes Enhanced - Kéo thả cải tiến"
    titleText.TextColor3 = Color3.fromRGB(255, 255, 255)
    titleText.TextScaled = true
    titleText.Font = Enum.Font.GothamBold
    titleText.TextXAlignment = Enum.TextXAlignment.Left
    titleText.Parent = titleBar
    
    -- Close Button
    local closeButton = Instance.new("TextButton")
    closeButton.Name = "CloseButton"
    closeButton.Size = UDim2.new(0, 30, 0, 30)
    closeButton.Position = UDim2.new(1, -35, 0, 5)
    closeButton.BackgroundColor3 = Color3.fromRGB(255, 0, 100)
    closeButton.BorderSizePixel = 0
    closeButton.Text = "✕"
    closeButton.TextColor3 = Color3.fromRGB(255, 255, 255)
    closeButton.TextScaled = true
    closeButton.Font = Enum.Font.GothamBold
    closeButton.Parent = titleBar
    
    local closeCorner = Instance.new("UICorner")
    closeCorner.CornerRadius = UDim.new(0, 8)
    closeCorner.Parent = closeButton
    
    -- Content Frame
    local contentFrame = Instance.new("Frame")
    contentFrame.Name = "ContentFrame"
    contentFrame.Size = UDim2.new(1, -20, 1, -60)
    contentFrame.Position = UDim2.new(0, 10, 0, 50)
    contentFrame.BackgroundColor3 = Color3.fromRGB(40, 40, 40)
    contentFrame.BorderSizePixel = 0
    contentFrame.Parent = mainFrame
    
    local contentCorner = Instance.new("UICorner")
    contentCorner.CornerRadius = UDim.new(0, 8)
    contentCorner.Parent = contentFrame
    
    -- Demo Content
    local demoText = Instance.new("TextLabel")
    demoText.Name = "DemoText"
    demoText.Size = UDim2.new(1, -20, 1, -20)
    demoText.Position = UDim2.new(0, 10, 0, 10)
    demoText.BackgroundTransparency = 1
    demoText.Text = [[
🎯 Tính năng Enhanced Dragger:

✅ Kéo thả mượt mà với animation
✅ Giữ frame trong màn hình
✅ Hiệu ứng visual khi kéo
✅ Hỗ trợ PC và Mobile
✅ Auto-return khi ra ngoài màn hình
✅ Boundary checking thông minh

📱 Cách sử dụng:
• Click và kéo title bar để di chuyển
• Frame sẽ có hiệu ứng visual khi kéo
• Tự động giữ trong màn hình
• Smooth animation khi thả

🔧 Áp dụng trong RoClothes:
Thay thế UIDragDetector bằng hệ thống này để có trải nghiệm tốt hơn!
]]
    demoText.TextColor3 = Color3.fromRGB(220, 220, 220)
    demoText.TextScaled = true
    demoText.Font = Enum.Font.Gotham
    demoText.TextWrapped = true
    demoText.TextYAlignment = Enum.TextYAlignment.Top
    demoText.Parent = contentFrame
    
    -- Apply enhanced dragger
    local dragger = createEnhancedDragger(mainFrame, titleBar)
    
    -- Close functionality
    closeButton.MouseButton1Click:Connect(function()
        local closeTween = TweenService:Create(mainFrame,
            TweenInfo.new(0.3, Enum.EasingStyle.Back, Enum.EasingDirection.In),
            {Size = UDim2.new(0, 0, 0, 0), Position = UDim2.new(0.5, 0, 0.5, 0)}
        )
        closeTween:Play()
        closeTween.Completed:Connect(function()
            screenGui:Destroy()
        end)
    end)
    
    -- Entry animation
    mainFrame.Size = UDim2.new(0, 0, 0, 0)
    mainFrame.Position = UDim2.new(0.5, 0, 0.5, 0)
    
    local entryTween = TweenService:Create(mainFrame,
        TweenInfo.new(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
        {Size = UDim2.new(0, 600, 0, 450), Position = UDim2.new(0.5, -300, 0.5, -225)}
    )
    entryTween:Play()
    
    return {
        screenGui = screenGui,
        mainFrame = mainFrame,
        dragger = dragger
    }
end

-- Create the enhanced RoClothes demo
local roClothesDemo = createRoClothesWithEnhancedDragger()

print("🎮 RoClothes Enhanced Dragger created successfully!")
print("📝 Drag the title bar to move the frame around")
print("🔧 This system can replace UIDragDetector in RoClothes for better compatibility")

-- Export the enhanced dragger function for use in other scripts
_G.CreateEnhancedDragger = createEnhancedDragger

return {
    createEnhancedDragger = createEnhancedDragger,
    roClothesDemo = roClothesDemo
}