/* Alpha-Beta Visualizer - Consolidated JavaScript */

console.log("Alpha-Beta Visualizer loading...");

// ===== GLOBAL VARIABLES =====
let useAlphaBeta = true; // Control variable for algorithm mode

// ===== NODE CLASS =====
function Node() {
    this.pos = [0, 0];
    this.children = [];
    this.value = null;  // Initialize as null instead of 0
    this.pruned = false;
    this.step = 0;
}

Node.prototype.setPruned = function() {
    this.pruned = true;
    for (const child of this.children) {
        child.setPruned();
    }
};

// Modified so algorithm can be stepped through
Node.prototype.minimax = function() {
    if (this.step == 0) {
        this.childSearchDone = false
        this.currentChildSearch = 0;
        if (this.children.length == 0) {
            if (this.parent != null) {
                this.parent.return = this.value;
            }
            if (this.parent == null) {
                return this.parent;
            }
            return this.parent.minimax();
        }
        if (this.max) {
            this.value = Number.NEGATIVE_INFINITY;
        } else {
            this.value = Number.POSITIVE_INFINITY;
        }
        this.step += 1;
    }
    if (this.step == 1) {
        if (this.currentChildSearch == this.children.length) {
            if (this.parent != null) {
                this.parent.return = this.value;
            }
            if (this.parent == null) {
                return this.parent;
            }
            return this.parent.minimax();
        }
        if (this.childSearchDone) {
            for (var i = this.currentChildSearch; i < this.children.length; i++) {
                this.children[i].setPruned();
            }
            this.currentChildSearch = this.children.length;
            return this;
        }
        var child = this.children[this.currentChildSearch];
        child.alpha = this.alpha;
        child.beta = this.beta;
        this.step += 1;
        return child;
    } else if (this.step == 2) {
        var childValue = this.return
        if (this.max) {
            this.value = Math.max(this.value, childValue);
            if (useAlphaBeta) {
                this.alpha = Math.max(this.alpha, childValue);
            }
        } else {
            this.value = Math.min(this.value, childValue);
            if (useAlphaBeta) {
                this.beta = Math.min(this.beta, childValue);
            }
        }
        // Only prune if alpha-beta is enabled
        if (useAlphaBeta && this.beta <= this.alpha) {
            this.childSearchDone = true;
        }
        this.currentChildSearch += 1;
        this.step -= 1;
        return this;
    }
};

Node.prototype.draw = function(ctx) {
    var blackValue = "#000000";
    if (this.pruned) {
        blackValue = "#bbbbbb";
    }
    for (const node of this.children) {
        ctx.lineWidth = Math.max(1, parseInt(Node.radius / 25));
        if (node.pruned) {
            ctx.strokeStyle = "#bbbbbb";
        } else {
            ctx.strokeStyle = "#000000";
        }
        ctx.beginPath();
        ctx.moveTo(this.pos[0], this.pos[1] + Node.radius - 1);
        ctx.lineTo(node.pos[0], node.pos[1] - Node.radius + 1);
        ctx.stroke();
        node.draw(ctx);
    }
    ctx.font = Node.radius + "px Helvetica";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.beginPath();
    ctx.arc(this.pos[0], this.pos[1], Node.radius, 0, 2 * Math.PI);
    
    if (this.pruned) {
        // Pruned nodes - gray
        ctx.fillStyle = "#9e9e9e"; // Gray color for pruned nodes
        ctx.fill();
        ctx.lineWidth = Math.max(1, parseInt(Node.radius / 10));
        ctx.strokeStyle = "#757575"; // Darker gray for border
        ctx.stroke();
        ctx.fillStyle = "#ffffff"; // White text
    } else if (this.max) {
        // MAX nodes - green
        ctx.fillStyle = "#28a745"; // Bootstrap success green
        ctx.fill();
        ctx.lineWidth = Math.max(1, parseInt(Node.radius / 10));
        ctx.strokeStyle = "#1e7e34"; // Darker green for border
        ctx.stroke();
        ctx.fillStyle = "#ffffff"; // White text
    } else {
        // MIN nodes - red
        ctx.fillStyle = "#dc3545"; // Bootstrap danger red
        ctx.fill();
        ctx.lineWidth = Math.max(1, parseInt(Node.radius / 10));
        ctx.strokeStyle = "#bd2130"; // Darker red for border
        ctx.stroke();
        ctx.fillStyle = "#ffffff"; // White text
    }
    if (this.value != null && this.value != Number.POSITIVE_INFINITY && this.value != Number.NEGATIVE_INFINITY) {
        ctx.fillText(this.value, this.pos[0], this.pos[1] + Node.radius / 15);
    }

    if (this.children.length == 0) {
        return;
    }

    ctx.font = "bold " + Node.radius / 2.5 + "px Helvetica";
    
    // Set text color based on pruned status
    if (this.pruned) {
        ctx.fillStyle = "#9e9e9e"; // Gray for pruned nodes
    } else {
        ctx.fillStyle = "#0000ff"; // Blue for normal nodes
    }

    // Only show alpha and beta values when alpha-beta mode is enabled
    if (useAlphaBeta) {
        var alphaText = "α: ";
        if (this.alpha == Number.POSITIVE_INFINITY) {
            alphaText += "Inf";
        } else if (this.alpha == Number.NEGATIVE_INFINITY) {
            alphaText += "-Inf";
        } else if (this.alpha == null){
            alphaText = "";
        } else {
            alphaText += this.alpha;
        }
        ctx.fillText(alphaText, this.pos[0], this.pos[1] - Node.radius * 2.2);
        
        var betaText = "β: ";
        if (this.beta == Number.POSITIVE_INFINITY) {
            betaText += "Inf";
        } else if (this.beta == Number.NEGATIVE_INFINITY) {
            betaText += "-Inf";
        } else if (this.beta == null){
            betaText = "";
        } else {
            betaText += this.beta;
        }
        ctx.fillText(betaText, this.pos[0], this.pos[1] - Node.radius * 1.7);
    }
};

// Method to detect if a click position is within this node or its children
Node.prototype.getNodeAtPosition = function(x, y) {
    // Check if click is within this node's circle
    var dx = x - this.pos[0];
    var dy = y - this.pos[1];
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    // Increase touch area for mobile devices
    var touchRadius = Node.radius;
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        // Mobile device - increase touch area by 50%
        touchRadius = Node.radius * 1.5;
    }
    
    if (distance <= touchRadius) {
        return this;
    }
    
    // Check children recursively
    for (const child of this.children) {
        var childResult = child.getNodeAtPosition(x, y);
        if (childResult != null) {
            return childResult;
        }
    }
    
    return null;
};

Node.radius = 0;

// ===== CONTROLS MANAGER =====
function setSelectedNode(node, isRoot) {
    // Desktop elements
    var unselectedInfo = document.getElementById("unselectedInfo");
    var nodeInfo = document.getElementById("nodeInfo");
    var deleteButton = document.getElementById("deleteNode");
    var runningInfo = document.getElementById("runningInfo");
    var nodeTypeText = document.getElementById("nodeTypeText");
    var nodeValueText = document.getElementById("nodeValueText");
    
    // Only proceed if desktop elements exist
    if (!unselectedInfo || !nodeInfo || !runningInfo) {
        console.log("Desktop control elements not found - likely on mobile");
        return;
    }
    
    if (node == -1) {
        unselectedInfo.classList.add("d-none");
        runningInfo.classList.remove("d-none");
        nodeInfo.classList.add("d-none");
        return;
    }
    
    if (node == null) {
        runningInfo.classList.add("d-none");
        unselectedInfo.classList.remove("d-none");
        nodeInfo.classList.add("d-none"); 
    } else {
        runningInfo.classList.add("d-none");
        unselectedInfo.classList.add("d-none"); 
        nodeInfo.classList.remove("d-none");
        
        // Actualizar información del nodo
        if (nodeTypeText && nodeValueText) {
            const nodeType = node.max ? "Nodo Maximizador" : "Nodo Minimizador";
            const icon = node.max ? '<i class="fas fa-caret-up text-success me-1"></i>' : '<i class="fas fa-caret-down text-danger me-1"></i>';
            nodeTypeText.innerHTML = `${icon}Tipo: ${nodeType}`;
            
            if (node.children.length === 0) {
                nodeValueText.textContent = `Valor: ${node.value !== null ? node.value : 'Haz clic para editar'}`;
            } else {
                nodeValueText.textContent = `Nodo interno (${node.children.length} hijos)`;
            }
        }
    }
    
    // Handle delete button visibility
    if (deleteButton) {
        if (isRoot) {
            deleteButton.classList.add("d-none");
        } else {
            deleteButton.classList.remove("d-none");
        }
    }
}

// ===== NODE MANAGER =====
function NodeManager(canvasID) {
    console.log("Initializing NodeManager with canvas ID:", canvasID);
    
    // Detect if mobile
    this.isMobile = window.innerWidth <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Try to get the appropriate canvas
    this.canvas = document.getElementById(canvasID);
    if (!this.canvas && this.isMobile) {
        this.canvas = document.getElementById('mobileCanvas');
    }
    if (!this.canvas && !this.isMobile) {
        this.canvas = document.getElementById('canvas');
    }
    
    if (!this.canvas) {
        console.error(`Canvas element not found`);
        return;
    }
    
    console.log("Canvas found:", this.canvas);
    
    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) {
        console.error("Unable to get 2D context from canvas");
        return;
    }
    
    console.log("Canvas context obtained successfully");
    
    // Initialize canvas size responsively
    this.resizeCanvas();
    
    console.log(`Canvas initialized with size: ${this.canvas.width}x${this.canvas.height}`);
    
    this.nodes = [];
    this.selected = null;
    this.bottomLayerCount = null;
    this.currentNode = null;
    this.history = [];  // Array para almacenar el historial de estados

    window.addEventListener("resize", () => {
        // Resize canvas and redraw on window resize
        this.resizeCanvas();
        setTimeout(() => this.draw(), 100);
    });
    
    // Canvas events
    this.canvas.addEventListener("mousedown", this.onMouseClick.bind(this));
    this.canvas.addEventListener("touchstart", this.onTouchStart.bind(this));
    
    // Initialize events based on device type
    if (this.isMobile) {
        this.initMobileEvents();
    } else {
        this.initDesktopEvents();
    }
    
    // Make node_manager globally accessible for debugging
    window.testInlineEditor = () => {
        console.log("Testing inline editor...");
        if (this.nodes.length > 0 && this.nodes[this.nodes.length - 1].length > 0) {
            const lastLayerNodes = this.nodes[this.nodes.length - 1];
            const testNode = lastLayerNodes[0]; // Primer nodo de la última capa
            console.log("Using test node:", testNode);
            this.showInlineEditor(testNode, 200, 200);
        } else {
            console.log("No leaf nodes available for testing");
        }
    };
}

// Initialize desktop events
NodeManager.prototype.initDesktopEvents = function() {
    const runBtn = document.getElementById("run");
    const stepBtn = document.getElementById("step");
    const stepBackBtn = document.getElementById("stepBack");
    const resetBtn = document.getElementById("reset");
    const addChildBtn = document.getElementById("addChild");
    const deleteNodeBtn = document.getElementById("deleteNode");
    const generateBtn = document.getElementById("generateTree");
    const toggleBtn = document.getElementById("alphaBetaToggle");
    
    if (runBtn) runBtn.addEventListener("click", this.run.bind(this));
    if (stepBtn) stepBtn.addEventListener("click", this.step.bind(this));
    if (stepBackBtn) stepBackBtn.addEventListener("click", this.stepBack.bind(this));
    if (resetBtn) resetBtn.addEventListener("click", this.reset.bind(this));
    if (addChildBtn) addChildBtn.addEventListener("click", this.addChild.bind(this));
    if (deleteNodeBtn) deleteNodeBtn.addEventListener("click", this.deleteNode.bind(this));
    if (generateBtn) generateBtn.addEventListener("click", this.generateRandomTree.bind(this));
    if (toggleBtn) toggleBtn.addEventListener("change", this.toggleAlphaBeta.bind(this));
};

// Initialize mobile events
NodeManager.prototype.initMobileEvents = function() {
    // Mobile controls panel toggle
    const controlsToggle = document.getElementById("mobileControlsToggle");
    const controlsHandle = document.getElementById("controlsHandle");
    const mobileControls = document.getElementById("mobileControls");
    
    if (controlsToggle && mobileControls) {
        controlsToggle.addEventListener("click", () => {
            mobileControls.classList.toggle("expanded");
            const icon = controlsToggle.querySelector("i");
            if (icon) {
                icon.className = mobileControls.classList.contains("expanded") ? 
                    "fas fa-chevron-down" : "fas fa-chevron-up";
            }
        });
    }
    
    if (controlsHandle && mobileControls) {
        controlsHandle.addEventListener("touchstart", (e) => {
            e.preventDefault();
            mobileControls.classList.toggle("expanded");
        });
    }
    
    // Mobile button events
    const mobileRunBtn = document.getElementById("mobileRun");
    const mobileStepBtn = document.getElementById("mobileStep");
    const mobileStepBackBtn = document.getElementById("mobileStepBack");
    const mobileResetBtn = document.getElementById("mobileReset");
    const mobileGenerateBtn = document.getElementById("mobileGenerate");
    const mobileAddChildBtn = document.getElementById("mobileAddChild");
    const mobileDeleteNodeBtn = document.getElementById("mobileDeleteNode");
    const mobileToggleBtn = document.getElementById("mobileAlphaBetaToggle");
    
    if (mobileRunBtn) mobileRunBtn.addEventListener("click", this.run.bind(this));
    if (mobileStepBtn) mobileStepBtn.addEventListener("click", this.step.bind(this));
    if (mobileStepBackBtn) mobileStepBackBtn.addEventListener("click", this.stepBack.bind(this));
    if (mobileResetBtn) mobileResetBtn.addEventListener("click", this.reset.bind(this));
    if (mobileGenerateBtn) mobileGenerateBtn.addEventListener("click", this.generateRandomTree.bind(this));
    if (mobileAddChildBtn) mobileAddChildBtn.addEventListener("click", this.addChild.bind(this));
    if (mobileDeleteNodeBtn) mobileDeleteNodeBtn.addEventListener("click", this.deleteNode.bind(this));
    if (mobileToggleBtn) mobileToggleBtn.addEventListener("change", this.toggleAlphaBeta.bind(this));
    
    // Handle orientation changes on mobile
    if (this.isMobile) {
        window.addEventListener('orientationchange', function() {
            setTimeout(() => {
                node_manager.resizeCanvas();
                node_manager.draw();
            }, 100);
        });
    }
};

// Canvas resize handler
NodeManager.prototype.resizeCanvas = function() {
    const container = this.canvas.parentElement;
    if (container) {
        // Get container dimensions
        const containerRect = container.getBoundingClientRect();
        
        let containerWidth, containerHeight;
        
        if (this.isMobile) {
            // Mobile: use full container with minimal padding
            containerWidth = containerRect.width - 10;
            containerHeight = containerRect.height - 10;
            
            // Set mobile-friendly minimum dimensions
            const minWidth = 300;
            const minHeight = 250;
            
            this.canvas.width = Math.max(containerWidth, minWidth);
            this.canvas.height = Math.max(containerHeight, minHeight);
        } else {
            // Desktop: use original logic
            containerWidth = containerRect.width - 20;
            containerHeight = containerRect.height - 20;
            
            const minWidth = 600;
            const minHeight = 400;
            
            this.canvas.width = Math.max(containerWidth, minWidth);
            this.canvas.height = Math.max(containerHeight, minHeight);
        }
        
        console.log(`Canvas resized to: ${this.canvas.width}x${this.canvas.height} (${this.isMobile ? 'Mobile' : 'Desktop'})`);
    }
};

// Sistema de notificaciones
NodeManager.prototype.showNotification = function(message, type = 'info') {
    // Remover notificación existente si hay una
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Ocultar notificación después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
};

// Editor inline para nodos
NodeManager.prototype.showInlineEditor = function(node, x, y) {
    console.log("=== SHOWING INLINE EDITOR ===");
    console.log("Node:", node, "X:", x, "Y:", y);
    
    // Remover editor existente si hay uno
    this.removeInlineEditor();
    
    // Crear el input inline
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'inline-editor';
    input.id = 'temp-inline-editor';
    input.value = node.value || '';
    input.placeholder = 'Valor...';
    input.min = '-99';
    input.max = '99';
    
    // Obtener la posición del canvas relativa al viewport
    const canvasRect = this.canvas.getBoundingClientRect();
    console.log("Canvas rect:", canvasRect);
    
    // Calcular posición absoluta
    const absoluteX = canvasRect.left + x;
    const absoluteY = canvasRect.top + y;
    const finalX = Math.min(absoluteX + 20, window.innerWidth - 120);
    const finalY = Math.min(absoluteY - 20, window.innerHeight - 60);
    
    console.log("Final position:", finalX, finalY);
    
    // Aplicar estilos finales y elegantes
    input.style.position = 'fixed';
    input.style.left = finalX + 'px';
    input.style.top = finalY + 'px';
    input.style.zIndex = '99999';
    input.style.display = 'block';
    input.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
    input.style.border = '2px solid #343a40';
    input.style.borderRadius = '8px';
    input.style.fontSize = '16px'; // Larger font for mobile
    input.style.textAlign = 'center';
    input.style.fontWeight = 'bold';
    input.style.boxShadow = '0 4px 20px rgba(52, 58, 64, 0.3)';
    input.style.backdropFilter = 'blur(10px)';
    input.style.outline = 'none';
    input.style.transition = 'all 0.2s ease';
    
    // Mobile-specific adjustments
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        input.style.width = '100px'; // Wider for touch
        input.style.height = '44px'; // Standard iOS touch target
        input.style.fontSize = '18px'; // Even larger font for mobile
        input.style.padding = '8px';
        // Prevent zoom on iOS
        input.style.webkitUserSelect = 'none';
        input.style.webkitTouchCallout = 'none';
    } else {
        input.style.width = '80px';
        input.style.height = '32px';
    }
    
    document.body.appendChild(input);
    console.log("Input element added to body:", input);
    console.log("Input is visible:", input.offsetWidth > 0 && input.offsetHeight > 0);
    
    // Forzar focus
    setTimeout(() => {
        console.log("Attempting to focus input");
        if (document.body.contains(input)) {
            input.focus();
            input.select();
        }
    }, 100);
    
    // Manejar eventos del input
    const handleSave = () => {
        let value = parseInt(input.value);
        if (isNaN(value)) value = 0;
        const clampedValue = Math.min(99, Math.max(-99, value));
        node.value = clampedValue;
        this.removeInlineEditor();
        
        if (this.selected === node) {
            const nodeValueText = document.getElementById("nodeValueText");
            if (nodeValueText) {
                nodeValueText.textContent = `Value: ${clampedValue}`;
            }
        }
        this.draw();
    };
    
    const handleCancel = () => {
        this.removeInlineEditor();
    };
    
    input.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    });
    
    input.addEventListener('blur', handleSave);
    
    // Additional touch support for mobile
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        // Add touch events to handle mobile interactions better
        input.addEventListener('touchstart', (e) => {
            e.stopPropagation();
        });
        
        input.addEventListener('touchend', (e) => {
            e.stopPropagation();
        });
        
        // Handle clicks outside the input on mobile
        const handleOutsideTouch = (e) => {
            if (!input.contains(e.target)) {
                handleSave();
                document.removeEventListener('touchstart', handleOutsideTouch);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('touchstart', handleOutsideTouch);
        }, 100);
    }
};

NodeManager.prototype.removeInlineEditor = function() {
    console.log("Removing existing inline editor...");
    const existingEditor = document.querySelector('.inline-editor');
    const existingEditorById = document.getElementById('temp-inline-editor');
    
    if (existingEditor) {
        console.log("Found and removing editor by class");
        existingEditor.remove();
    }
    if (existingEditorById) {
        console.log("Found and removing editor by ID");
        existingEditorById.remove();
    }
    
    // Cleanup adicional por si acaso
    const allInputs = document.querySelectorAll('input[type="number"]');
    allInputs.forEach(input => {
        if (input.className.includes('inline-editor') || input.id === 'temp-inline-editor') {
            console.log("Removing stray input:", input);
            input.remove();
        }
    });
};

NodeManager.prototype.reset = function() {
    if (this.selected != -1) {
        return;
    }
    this.selected = null;
    this.currentNode = null;
    this.history = [];  // Limpiar historial
    for (const nodeLayer of this.nodes) {
        for (const node of nodeLayer) {
            node.pruned = false;
            node.step = 0;
            node.alpha = null;
            node.beta = null;
            if (node.children.length != 0) {
                node.value = null;
            }
        }
    }
    setSelectedNode(this.selected, this.selected == this.nodes[0][0]);
    this.draw();
};

NodeManager.prototype.saveState = function() {
    var state = {
        currentNode: this.currentNode,
        selected: this.selected,
        nodes: []
    };
    
    // Guardar estado de todos los nodos
    for (const nodeLayer of this.nodes) {
        var layerState = [];
        for (const node of nodeLayer) {
            layerState.push({
                pruned: node.pruned,
                step: node.step,
                alpha: node.alpha,
                beta: node.beta,
                value: node.value,
                childSearchDone: node.childSearchDone,
                currentChildSearch: node.currentChildSearch
            });
        }
        state.nodes.push(layerState);
    }
    
    this.history.push(state);
};

NodeManager.prototype.restoreState = function(state) {
    this.currentNode = state.currentNode;
    this.selected = state.selected;
    
    // Restaurar estado de todos los nodos
    for (var i = 0; i < this.nodes.length; i++) {
        for (var j = 0; j < this.nodes[i].length; j++) {
            var node = this.nodes[i][j];
            var nodeState = state.nodes[i][j];
            node.pruned = nodeState.pruned;
            node.step = nodeState.step;
            node.alpha = nodeState.alpha;
            node.beta = nodeState.beta;
            node.value = nodeState.value;
            node.childSearchDone = nodeState.childSearchDone;
            node.currentChildSearch = nodeState.currentChildSearch;
        }
    }
    
    // Actualizar la interfaz según el estado seleccionado
    setSelectedNode(this.selected, this.selected == this.nodes[0][0]);
};

NodeManager.prototype.stepBack = function() {
    if (this.history.length > 0) {
        var previousState = this.history.pop();
        this.restoreState(previousState);
        this.draw();
    }
};

NodeManager.prototype.step = function() {
    // Guardar estado antes del paso
    this.saveState();
    
    if (this.currentNode != null) {
        this.currentNode = this.currentNode.minimax();
    } else if (this.selected != -1) {
        // Inicializar algoritmo alpha-beta
        this.selected = -1;
        setSelectedNode(this.selected, this.selected == this.nodes[0][0]);
        this.nodes[0][0].alpha = Number.NEGATIVE_INFINITY;
        this.nodes[0][0].beta = Number.POSITIVE_INFINITY;
        this.currentNode = this.nodes[0][0];
    } else {
        // Si selected es null, también inicializar
        this.selected = -1;
        setSelectedNode(this.selected, this.selected == this.nodes[0][0]);
        this.nodes[0][0].alpha = Number.NEGATIVE_INFINITY;
        this.nodes[0][0].beta = Number.POSITIVE_INFINITY;
        this.currentNode = this.nodes[0][0];
    }
    this.draw();
}

NodeManager.prototype.run = function() {
    if (this.selected != -1) {
        this.selected = -1;
        setSelectedNode(this.selected, this.selected == this.nodes[0][0]);
        this.nodes[0][0].alpha = Number.NEGATIVE_INFINITY;
        this.nodes[0][0].beta = Number.POSITIVE_INFINITY;
        this.currentNode = this.nodes[0][0];
    }
    while (this.currentNode != null) {
        this.currentNode = this.currentNode.minimax();
    }
    this.draw();
};

NodeManager.prototype.addChild = function() {
    if (this.selected == null) {
        return;
    }
    this.selected.value = null;
    var newNode = new Node();
    newNode.layer = this.selected.layer + 1;
    newNode.max = !this.selected.max;
    newNode.parent = this.selected;
    this.selected.children.push(newNode);
    if (newNode.layer == this.nodes.length) {
        this.nodes.push([]);
    }
    this.nodes[newNode.layer].push(newNode);
    this.bottomLayerCount = null;
    setSelectedNode(this.selected, this.selected == this.nodes[0][0]);
    this.draw();
};

NodeManager.prototype.generateRandomTree = function() {
    // Siempre generar 4 niveles (5 capas total)
    const numLayers = 3;
    const totalLayers = numLayers + 1;
    
    // Limpiar árbol actual y resetear estado del algoritmo
    this.nodes = [];
    this.selected = null;
    this.currentNode = null;
    this.history = [];
    this.bottomLayerCount = null;
    
    // Crear nodo raíz
    var rootNode = new Node();
    rootNode.layer = 0;
    rootNode.max = true;
    rootNode.parent = null;
    this.nodes.push([rootNode]);
    
    // Generar árbol capa por capa
    for (let layer = 0; layer < totalLayers - 1; layer++) {
        const currentLayerNodes = this.nodes[layer];
        const nextLayer = [];
        
        for (const node of currentLayerNodes) {
            // Número de hijos basado en la capa para crear un árbol más interesante
            let numChildren;
            if (layer === 0) {
                numChildren = Math.floor(Math.random() * 2) + 2; // Raíz: 2-3 hijos
            } else if (layer === totalLayers - 2) {
                numChildren = Math.floor(Math.random() * 3) + 2; // Penúltima capa: 2-4 hijos
            } else {
                numChildren = Math.floor(Math.random() * 2) + 2; // Otras capas: 2-3 hijos
            }
            
            for (let i = 0; i < numChildren; i++) {
                var childNode = new Node();
                childNode.layer = layer + 1;
                childNode.max = !node.max; // Alternar entre max y min
                childNode.parent = node;
                
                // Si es la última capa (nodos hoja), asignar valor aleatorio
                if (layer + 1 === totalLayers - 1) {
                    // Generar valores más variados para hacer el algoritmo más interesante
                    const randomValue = Math.floor(Math.random() * 41) - 20; // Rango -20 a 20
                    childNode.value = randomValue;
                } else {
                    childNode.value = null; // Nodos internos no tienen valor inicial
                }
                
                node.children.push(childNode);
                nextLayer.push(childNode);
            }
        }
        
        if (nextLayer.length > 0) {
            this.nodes.push(nextLayer);
        }
    }
    
    // Actualizar interfaz
    setSelectedNode(null, false);
    this.resizeCanvas();
    this.draw();
    
    console.log(`Árbol generado con ${totalLayers} capas (usuario solicitó ${numLayers}) y ${this.nodes[this.nodes.length - 1].length} nodos hoja`);
};

NodeManager.prototype.deleteNode = function() {
    if (this.selected == null || this.selected.layer == 0) {
        return;
    }
    var nodeStack = [this.selected];
    while (nodeStack.length != 0) {
        var node = nodeStack.pop();
        for (var i = 0; i < this.nodes[node.layer].length; i++) {
            if (this.nodes[node.layer][i] == node) {
                this.nodes[node.layer].splice(i, 1);
                break;
            }
        }
        for (const child of node.children.slice().reverse()) {
            nodeStack.push(child);
        }
    }
    for (var i = this.nodes.length - 1; i >= 0; i--) {
        if (this.nodes[i].length == 0) {
            this.nodes.splice(i, 1);
        }
    }
    var done = false;
    for (const node of this.nodes[this.selected.layer - 1]) {
        for (var i = 0; i < node.children.length; i++) {
            if (node.children[i] == this.selected) {
                node.children.splice(i, 1);
                if (node.children.length == 0) {
                    node.value = null;
                }
                done = true;
                break;
            }
        }
        if (done) {
            break;
        }
    }
    this.selected = null;
    setSelectedNode(this.selected, this.selected == this.nodes[0][0]);
    this.bottomLayerCount = null;
    this.draw();
};

NodeManager.prototype.getEventCoordinates = function(event) {
    const rect = this.canvas.getBoundingClientRect();
    
    if (event.type.startsWith('touch')) {
        // Touch event
        const touch = event.touches[0] || event.changedTouches[0];
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    } else {
        // Mouse event
        return {
            x: event.offsetX,
            y: event.offsetY
        };
    }
};

// Touch event handler
NodeManager.prototype.onTouchStart = function(event) {
    event.preventDefault(); // Prevent scrolling and other default behaviors
    console.log("Touch detected!");
    
    if (this.selected == -1) {
        console.log("Algorithm is running, touch ignored");
        return;
    }
    
    const coords = this.getEventCoordinates(event);
    console.log("Touch coordinates:", coords.x, coords.y);
    
    this.handleNodeInteraction(coords.x, coords.y);
};

// Generic node interaction handler (used by both mouse and touch)
NodeManager.prototype.handleNodeInteraction = function(x, y) {
    this.selected = null;
    var clickedNode = null;
    
    // Usar la nueva función de detección de triángulos
    if (this.nodes.length > 0) {
        clickedNode = this.nodes[0][0].getNodeAtPosition(x, y);
        if (clickedNode) {
            this.selected = clickedNode;
            console.log("Node clicked:", clickedNode);
        }
    }
    
    // Handle mobile vs desktop differently
    if (this.isMobile) {
        // Mobile: Show node info and handle leaf node editing
        this.showMobileNodeInfo(clickedNode);
        
        if (clickedNode && clickedNode.children.length === 0) {
            console.log("=== MOBILE LEAF NODE CLICKED ===");
            this.showMobileValueEditor(clickedNode, x, y);
        }
    } else {
        // Desktop: Use existing inline editor
        if (clickedNode && clickedNode.children.length === 0) {
            console.log("=== DESKTOP LEAF NODE CLICKED ===");
            this.showInlineEditor(clickedNode, x, y);
        }
        
        setSelectedNode(this.selected, this.selected == this.nodes[0][0]);
    }
    
    this.draw();
};

NodeManager.prototype.onMouseClick = function(event) {
    console.log("Click detected!", this.selected, event.offsetX, event.offsetY);
    
    if (this.selected == -1) {
        console.log("Algorithm is running, click ignored");
        return;
    }
    
    const coords = this.getEventCoordinates(event);
    this.handleNodeInteraction(coords.x, coords.y);
};

NodeManager.prototype.setNodeRadius = function() {
    if (this.bottomLayerCount == null) {
        this.bottomLayerCount = 0;
        var nodeStack = [this.nodes[0][0]];
        while (nodeStack.length != 0) {
            var node = nodeStack.pop();
            if (node.children.length == 0) {
                this.bottomLayerCount += 1;
            } else {
                for (const child of node.children.slice().reverse()) {
                    nodeStack.push(child);
                }
            }
        }
    }
    var xDiam = this.canvas.width / (0.5 + 1.5 * this.bottomLayerCount);
    var yDiam = this.canvas.height / (1 + 2 * this.nodes.length);
    Node.radius = Math.min(xDiam, yDiam) / 2;
};

NodeManager.prototype.setNodePositions = function() {
    var xOffset = (this.canvas.width - Node.radius * (1 + 3 * this.bottomLayerCount)) / 2;
    var yOffset = (this.canvas.height - Node.radius * (1 + 4 * this.nodes.length)) / 2;
    var count = 2;
    var nodeStack = [this.nodes[0][0]];
    while (nodeStack.length != 0) {
        var node = nodeStack.pop();
        if (node.children.length == 0) {
            node.pos[0] = xOffset + count * Node.radius;
            node.pos[1] = yOffset + (2 + 4 * node.layer) * Node.radius;
            count += 3;
        } else {
            for (const child of node.children.slice().reverse()) {
                nodeStack.push(child);
            }
        }
    }
    for (const nodeLayer of this.nodes.slice(0, -1).reverse()) {
        for (const node of nodeLayer) {
            if (node.children.length != 0) {
                node.pos[0] = (node.children[0].pos[0] + node.children[node.children.length - 1].pos[0]) / 2;
                node.pos[1] = yOffset + (2 + 4 * node.layer) * Node.radius;
            }
        }
    }
};

NodeManager.prototype.draw = function() {
    console.log("Draw method called. Nodes:", this.nodes.length > 0 ? "Has nodes" : "No nodes");
    
    // Check if canvas is valid before proceeding
    if (!this.canvas || !this.ctx) {
        console.error("Canvas or context not available for drawing");
        return;
    }
    
    console.log(`Canvas size: ${this.canvas.width}x${this.canvas.height}`);
    
    try {
        // Simple canvas sizing
        if (this.canvas.width <= 0 || this.canvas.height <= 0) {
            this.canvas.width = 800;
            this.canvas.height = 600;
            console.log("Reset canvas to default size");
        }
        
        this.setNodeRadius();
        this.setNodePositions();
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.nodes.length > 0 && this.nodes[0].length > 0) {
            console.log("Drawing tree with root node");
            this.nodes[0][0].draw(this.ctx);
            console.log("Tree drawn successfully");
        } else {
            console.warn("No nodes to draw - drawing placeholder");
            // Draw a placeholder message
            this.ctx.fillStyle = "#495057";
            this.ctx.font = "24px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText("🌳 Haz clic en 'Generar Árbol Aleatorio' para comenzar", this.canvas.width/2, this.canvas.height/2 - 20);
            
            this.ctx.fillStyle = "#6c757d";
            this.ctx.font = "16px Arial";
            this.ctx.fillText("El árbol aparecerá aquí una vez generado", this.canvas.width/2, this.canvas.height/2 + 20);
        }
    } catch (error) {
        console.error("Error in draw method:", error);
    }
    
    var highlight = this.selected;
    if (this.currentNode != null) {
        highlight = this.currentNode;
    }
    if (highlight != null && highlight != -1) {
        // Mejorar la visualización del nodo destacado
        this.ctx.save();
        this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        this.ctx.shadowBlur = 15;
        this.ctx.lineWidth = Math.max(3, parseInt(Node.radius / 8));
        this.ctx.strokeStyle = "#343a40";
        this.ctx.beginPath();
        this.ctx.arc(highlight.pos[0], highlight.pos[1], Node.radius + 5, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.restore();
    }
};

NodeManager.prototype.toggleAlphaBeta = function() {
    const toggle = document.getElementById('alphaBetaToggle');
    const label = document.getElementById('toggleLabel');
    const description = document.getElementById('toggleDescription');
    
    useAlphaBeta = toggle.checked;
    
    if (useAlphaBeta) {
        label.innerHTML = '<i class="fas fa-cut me-2"></i>Poda Alpha-Beta';
        description.textContent = 'Algoritmo optimizado con poda alpha-beta';
    } else {
        label.innerHTML = '<i class="fas fa-tree me-2"></i>Minimax Puro';
        description.textContent = 'Algoritmo minimax sin optimizaciones';
    }
    
    // Reset the tree state when changing algorithm mode
    this.reset();
    
    // Redraw to update the display immediately
    this.draw();
    
    console.log(`Algorithm mode changed to: ${useAlphaBeta ? 'Alpha-Beta' : 'Pure Minimax'}`);
};

// ===== MAIN APPLICATION =====
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing application...");
    
    try {
        // Detect device type and initialize appropriate canvas
        const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const canvasId = isMobile ? "mobileCanvas" : "canvas";
        
        console.log(`Detected device: ${isMobile ? 'Mobile' : 'Desktop'}, using canvas: ${canvasId}`);
        
        // Initialize the node manager
        console.log("Creating NodeManager...");
        var node_manager = new NodeManager(canvasId);
        
        if (!node_manager || !node_manager.canvas) {
            console.error("Failed to initialize NodeManager - canvas not found");
            return;
        }
        
        console.log("NodeManager created successfully");
        
        // Generate a default tree with proper values
        console.log("Generating default tree...");
        node_manager.generateRandomTree();
        
        // Initialize Bootstrap tooltips
        console.log("Initializing tooltips...");
        if (typeof bootstrap !== 'undefined') {
            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
        
        console.log("Application initialized successfully");
        
        // Make node_manager globally accessible for debugging
        window.nodeManager = node_manager;
        
        // Force canvas resize on mobile after initialization
        if (isMobile) {
            setTimeout(() => {
                console.log("Force resizing mobile canvas...");
                node_manager.resizeCanvas();
                node_manager.draw();
            }, 200);
            
            // Also resize when the controls panel is toggled
            const mobileControls = document.getElementById('mobileControls');
            if (mobileControls) {
                const observer = new MutationObserver(() => {
                    setTimeout(() => {
                        node_manager.resizeCanvas();
                        node_manager.draw();
                    }, 100);
                });
                observer.observe(mobileControls, { attributes: true, attributeFilter: ['class'] });
            }
        }
    } catch (error) {
        console.error("Error during initialization:", error);
    }
});

// Mobile-specific functions
NodeManager.prototype.showMobileNodeInfo = function(node) {
    const mobileNodeInfo = document.getElementById("mobileNodeInfo");
    const mobileNodeContent = document.getElementById("mobileNodeContent");
    const mobileNodeActions = document.getElementById("mobileNodeActions");
    
    if (!mobileNodeInfo || !mobileNodeContent) return;
    
    if (node) {
        const isLeaf = node.children.length === 0;
        const nodeType = isLeaf ? "Hoja" : (node.max ? "MAX" : "MIN");
        const nodeValue = node.value !== null ? node.value : "Sin valor";
        
        mobileNodeContent.innerHTML = `
            <div class="fw-bold text-primary">${nodeType}</div>
            <div class="small">Valor: ${nodeValue}</div>
            ${node.alpha !== null ? `<div class="small text-success">α: ${node.alpha}</div>` : ''}
            ${node.beta !== null ? `<div class="small text-danger">β: ${node.beta}</div>` : ''}
        `;
        
        mobileNodeInfo.classList.add("show");
        
        // Show node actions if applicable
        if (mobileNodeActions) {
            if (this.selected === node) {
                mobileNodeActions.classList.remove("d-none");
            } else {
                mobileNodeActions.classList.add("d-none");
            }
        }
    } else {
        mobileNodeContent.innerHTML = '<small class="text-muted">Toca un nodo</small>';
        mobileNodeInfo.classList.remove("show");
        if (mobileNodeActions) {
            mobileNodeActions.classList.add("d-none");
        }
    }
};

// Mobile value editor
NodeManager.prototype.showMobileValueEditor = function(node, x, y) {
    console.log("=== SHOWING MOBILE VALUE EDITOR ===");
    console.log("Node:", node, "X:", x, "Y:", y);
    
    // Remove existing editor
    this.removeMobileValueEditor();
    
    // Create mobile input
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'mobile-value-input';
    input.id = 'mobile-value-input';
    input.value = node.value || '';
    input.placeholder = 'Valor';
    input.min = '-99';
    input.max = '99';
    input.inputMode = 'numeric';
    input.pattern = '[0-9]*';
    
    // Position the input
    const canvasRect = this.canvas.getBoundingClientRect();
    const finalX = Math.min(x + canvasRect.left - 60, window.innerWidth - 130);
    const finalY = Math.max(y + canvasRect.top - 60, 70);
    
    input.style.left = finalX + 'px';
    input.style.top = finalY + 'px';
    
    document.body.appendChild(input);
    
    // Focus and select
    setTimeout(() => {
        input.focus();
        input.select();
    }, 50);
    
    // Handle save
    const handleSave = () => {
        let value = parseInt(input.value);
        if (isNaN(value)) value = 0;
        const clampedValue = Math.min(99, Math.max(-99, value));
        node.value = clampedValue;
        this.removeMobileValueEditor();
        this.showMobileNodeInfo(node);
        this.draw();
    };
    
    // Handle cancel
    const handleCancel = () => {
        this.removeMobileValueEditor();
    };
    
    // Events
    input.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    });
    
    input.addEventListener('blur', handleSave);
    
    // Handle touch outside
    const handleOutsideTouch = (e) => {
        if (!input.contains(e.target) && !e.target.closest('.mobile-controls')) {
            handleSave();
            document.removeEventListener('touchstart', handleOutsideTouch);
        }
    };
    
    setTimeout(() => {
        document.addEventListener('touchstart', handleOutsideTouch);
    }, 100);
};

NodeManager.prototype.removeMobileValueEditor = function() {
    const existingEditor = document.getElementById('mobile-value-input');
    if (existingEditor) {
        existingEditor.remove();
    }
};
