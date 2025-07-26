// Tab switching functionality
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and panels
            tabs.forEach(t => t.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // Add active class to clicked tab
            tab.classList.add('active');

            // Show corresponding panel
            const tabName = tab.getAttribute('data-tab');
            const targetPanel = document.getElementById(tabName);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

// Script editor functionality
function initScriptEditor() {
    const scriptEditor = document.querySelector('.script-editor');
    const executeBtn = document.querySelector('.execute-btn');
    const clearBtn = document.querySelector('.action-buttons .btn-secondary:nth-child(3)');
    const consoleOutput = document.querySelector('.console-output');

    // Execute button functionality
    executeBtn.addEventListener('click', () => {
        const script = scriptEditor.value.trim();
        
        if (!script) {
            addConsoleMessage('[ERROR] No script to execute', 'error');
            return;
        }

        // Add loading state
        executeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Executing...';
        executeBtn.disabled = true;

        // Simulate script execution
        setTimeout(() => {
            addConsoleMessage('[INFO] Executing script...', 'info');
            addConsoleMessage('[SUCCESS] Script executed successfully', 'success');
            addConsoleMessage(`[OUTPUT] ${script}`, 'output');
            
            // Reset button
            executeBtn.innerHTML = '<i class="fas fa-play"></i> Execute';
            executeBtn.disabled = false;
        }, 2000);
    });

    // Clear button functionality
    clearBtn.addEventListener('click', () => {
        scriptEditor.value = '';
        addConsoleMessage('[INFO] Script editor cleared', 'info');
    });

    // Control buttons
    const controls = document.querySelectorAll('.btn-icon');
    controls.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            switch(index) {
                case 0: // Clear
                    scriptEditor.value = '';
                    addConsoleMessage('[INFO] Script editor cleared', 'info');
                    break;
                case 1: // Open File
                    addConsoleMessage('[INFO] File browser opened', 'info');
                    break;
                case 2: // Save
                    if (scriptEditor.value.trim()) {
                        addConsoleMessage('[INFO] Script saved successfully', 'success');
                    } else {
                        addConsoleMessage('[WARNING] No script to save', 'warning');
                    }
                    break;
            }
        });
    });
}

// Console functionality
function addConsoleMessage(message, type = 'info') {
    const consoleOutput = document.querySelector('.console-output');
    const consoleLine = document.createElement('div');
    consoleLine.className = 'console-line';
    
    // Set color based on message type
    switch(type) {
        case 'error':
            consoleLine.style.color = '#ff4757';
            break;
        case 'success':
            consoleLine.style.color = '#00ff88';
            break;
        case 'warning':
            consoleLine.style.color = '#ffa502';
            break;
        case 'output':
            consoleLine.style.color = '#ffffff';
            break;
        default:
            consoleLine.style.color = '#4a90e2';
    }
    
    consoleLine.textContent = message;
    consoleOutput.appendChild(consoleLine);
    
    // Auto scroll to bottom
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
    
    // Keep only last 20 messages
    const lines = consoleOutput.querySelectorAll('.console-line');
    if (lines.length > 20) {
        lines[0].remove();
    }
}

// Script list functionality
function initScriptList() {
    const scriptItems = document.querySelectorAll('.script-item');
    const scriptEditor = document.querySelector('.script-editor');

    scriptItems.forEach(item => {
        const loadBtn = item.querySelector('.btn-small');
        const scriptName = item.querySelector('span').textContent;

        loadBtn.addEventListener('click', () => {
            // Sample scripts
            const scripts = {
                'Auto Farm Script': `-- Auto Farm Script
for i = 1, 100 do
    wait(1)
    print("Farming... " .. i)
end
print("Auto farm completed!")`,
                'Speed Hack': `-- Speed Hack Script
local player = game.Players.LocalPlayer
local character = player.Character
if character then
    character.Humanoid.WalkSpeed = 100
    print("Speed increased to 100!")
end`,
                'Teleport Script': `-- Teleport Script
local player = game.Players.LocalPlayer
local character = player.Character
if character then
    character.HumanoidRootPart.CFrame = CFrame.new(0, 50, 0)
    print("Teleported to spawn!")
end`
            };

            scriptEditor.value = scripts[scriptName] || `-- ${scriptName}\nprint("Script loaded: ${scriptName}")`;
            addConsoleMessage(`[INFO] Loaded script: ${scriptName}`, 'info');
        });
    });
}

// Settings functionality
function initSettings() {
    const switches = document.querySelectorAll('.switch input');
    
    switches.forEach((switchInput, index) => {
        switchInput.addEventListener('change', () => {
            const settings = [
                'Auto-attach on startup',
                'Enable notifications',
                'Dark theme'
            ];
            
            const setting = settings[index];
            const status = switchInput.checked ? 'enabled' : 'disabled';
            addConsoleMessage(`[SETTINGS] ${setting} ${status}`, 'info');
        });
    });
}

// Feature cards interaction
function initFeatureCards() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('click', () => {
            const feature = card.querySelector('span').textContent;
            addConsoleMessage(`[FEATURE] ${feature} activated`, 'info');
            
            // Add visual feedback
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        });
    });
}

// Stop button functionality
function initStopButton() {
    const stopBtn = document.querySelector('.action-buttons .btn-secondary:nth-child(2)');
    
    stopBtn.addEventListener('click', () => {
        addConsoleMessage('[INFO] Script execution stopped', 'warning');
        
        // Reset execute button if it's in loading state
        const executeBtn = document.querySelector('.execute-btn');
        executeBtn.innerHTML = '<i class="fas fa-play"></i> Execute';
        executeBtn.disabled = false;
    });
}

// Animation effects
function initAnimations() {
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('button, .feature-card, .script-item');
    
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

// Initialize status dot animation
function initStatusAnimation() {
    const statusDot = document.querySelector('.status-dot');
    let connected = true;
    
    setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance to change status
            connected = !connected;
            statusDot.style.background = connected ? '#00ff88' : '#ff4757';
            
            const statusText = document.querySelector('.status span:last-child');
            statusText.textContent = connected ? 'Connected' : 'Disconnected';
            
            addConsoleMessage(`[STATUS] ${connected ? 'Connected' : 'Disconnected'}`, connected ? 'success' : 'error');
        }
    }, 5000);
}

// Keyboard shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'Enter':
                    e.preventDefault();
                    document.querySelector('.execute-btn').click();
                    break;
                case 's':
                    e.preventDefault();
                    addConsoleMessage('[INFO] Script saved (Ctrl+S)', 'info');
                    break;
                case 'o':
                    e.preventDefault();
                    addConsoleMessage('[INFO] Open file (Ctrl+O)', 'info');
                    break;
            }
        }
    });
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initScriptEditor();
    initScriptList();
    initSettings();
    initFeatureCards();
    initStopButton();
    initAnimations();
    initStatusAnimation();
    initKeyboardShortcuts();
    
    // Initial console message
    setTimeout(() => {
        addConsoleMessage('[SYSTEM] Executor X initialized successfully', 'success');
        addConsoleMessage('[INFO] Welcome to Executor X V5', 'info');
    }, 1000);
});

// Add some interactive features for demonstration
setInterval(() => {
    // Random system messages
    const messages = [
        '[SYSTEM] Monitoring script performance...',
        '[INFO] Memory usage: 45%',
        '[DEBUG] Checking for updates...',
        '[INFO] All systems operational'
    ];
    
    if (Math.random() < 0.3) { // 30% chance every 10 seconds
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        addConsoleMessage(randomMessage, 'info');
    }
}, 10000);