class KindnessChain {
    constructor() {
        this.container = document.getElementById('chainContainer');
        this.canvas = document.getElementById('chainCanvas'); // Should be a <div> in HTML
        this.avatars = document.querySelectorAll('.neighbor-avatar');
        this.chainLength = document.getElementById('chainLength');
        this.chainPoints = document.getElementById('chainPoints');
        this.chainTime = document.getElementById('chainTime');
        this.chainStory = document.getElementById('chainStory');
        
        this.chainSequence = [
            { from: 1, to: 2, points: 15, story: "Maria helped John fix his bike..." },
            { from: 2, to: 3, points: 20, story: "John helped Alex plant a garden..." },
            { from: 3, to: 4, points: 25, story: "Alex helped Sarah with math homework..." },
            { from: 4, to: 5, points: 30, story: "Sarah helped David learn guitar..." },
            { from: 5, to: 1, points: 35, story: "David cooked dinner for Maria, completing the circle!" }
        ];
        
        this.currentStep = 0;
        this.totalPoints = 0;
        this.startTime = null;
        this.isRunning = false;
        
        this.init();
    }
    
    init() {
        document.getElementById('startChain').addEventListener('click', () => this.start());
        document.getElementById('resetChain').addEventListener('click', () => this.reset());
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = Date.now();
        this.currentStep = 0;
        this.totalPoints = 0;
        
        const startBtn = document.getElementById('startChain');
        startBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin mr-2"></i>Chain Running...';
        startBtn.classList.add('opacity-75');
        
        this.runStep();
    }

    // DEBUG: Added missing reset method
    reset() {
        this.isRunning = false;
        this.currentStep = 0;
        this.totalPoints = 0;
        this.canvas.innerHTML = ''; 
        this.chainLength.textContent = '0';
        this.chainPoints.textContent = '0';
        this.chainTime.textContent = '0s';
        this.chainStory.textContent = 'Click start to begin the chain!';
        
        const startBtn = document.getElementById('startChain');
        startBtn.innerHTML = 'Start Chain';
        startBtn.classList.remove('opacity-75');
    }
    
    runStep() {
        if (!this.isRunning) return; // Prevent execution if reset during animation

        if (this.currentStep >= this.chainSequence.length) {
            this.completeChain();
            return;
        }
        
        const step = this.chainSequence[this.currentStep];
        this.chainStory.textContent = step.story;
        
        this.highlightAvatar(step.from);
        
        setTimeout(() => {
            if (!this.isRunning) return;
            this.highlightAvatar(step.to);
            this.drawChainLink(step.from, step.to);
            this.animatePointsFlow(step.from, step.to, step.points);
            
            this.totalPoints += step.points;
            this.chainLength.textContent = this.currentStep + 1;
            this.chainPoints.textContent = this.totalPoints;
            this.chainTime.textContent = `${Math.floor((Date.now() - this.startTime) / 1000)}s`;
            
            this.currentStep++;
            setTimeout(() => this.runStep(), 1500);
        }, 800);
    }
    
    highlightAvatar(id) {
        const avatar = document.querySelector(`.neighbor-avatar[data-id="${id}"]`);
        if (!avatar) return;

        avatar.classList.add('active');
        const glow = document.createElement('div');
        glow.className = 'absolute inset-0 rounded-full bg-yellow-400 opacity-20';
        avatar.appendChild(glow);
        
        setTimeout(() => {
            avatar.classList.remove('active');
            glow.remove();
        }, 1000);
    }
    
    drawChainLink(fromId, toId) {
        const fromAvatar = document.querySelector(`.neighbor-avatar[data-id="${fromId}"]`);
        const toAvatar = document.querySelector(`.neighbor-avatar[data-id="${toId}"]`);
        
        const fromRect = fromAvatar.getBoundingClientRect();
        const toRect = toAvatar.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        
        const x1 = fromRect.left + fromRect.width/2 - containerRect.left;
        const y1 = fromRect.top + fromRect.height/2 - containerRect.top;
        const x2 = toRect.left + toRect.width/2 - containerRect.left;
        const y2 = toRect.top + toRect.height/2 - containerRect.top;
        
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        const link = document.createElement('div');
        link.className = 'chain-link';
        link.style.position = 'absolute'; // Ensure CSS handles this if not in stylesheet
        link.style.width = `${distance}px`;
        link.style.left = `${x1}px`;
        link.style.top = `${y1}px`;
        link.style.transformOrigin = '0 0'; // Critical for correct rotation
        link.style.transform = `rotate(${angle}deg)`;
        link.style.opacity = '0';
        
        this.canvas.appendChild(link);
        
        setTimeout(() => {
            link.style.transition = 'opacity 0.5s ease';
            link.style.opacity = '1';
        }, 100);
        
        const links = this.canvas.querySelectorAll('.chain-link');
        if (links.length > 5) links[0].remove();
    }
    
    animatePointsFlow(fromId, toId, points) {
        const fromAvatar = document.querySelector(`.neighbor-avatar[data-id="${fromId}"]`);
        const toAvatar = document.querySelector(`.neighbor-avatar[data-id="${toId}"]`);
        
        const fromRect = fromAvatar.getBoundingClientRect();
        const toRect = toAvatar.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        
        const bubble = document.createElement('div');
        bubble.className = 'point-bubble';
        bubble.textContent = `+${points}`;
        bubble.style.position = 'absolute';
        bubble.style.left = `${fromRect.left + fromRect.width/2 - containerRect.left - 12}px`;
        bubble.style.top = `${fromRect.top + fromRect.height/2 - containerRect.top - 12}px`;
        
        this.container.appendChild(bubble);
        
        setTimeout(() => {
            bubble.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
            bubble.style.left = `${toRect.left + toRect.width/2 - containerRect.left - 12}px`;
            bubble.style.top = `${toRect.top + toRect.height/2 - containerRect.top - 12}px`;
            bubble.style.transform = 'scale(0.5)';
            
            setTimeout(() => {
                bubble.remove();
                toAvatar.style.transform = 'scale(1.15)';
                setTimeout(() => toAvatar.style.transform = 'scale(1)', 300);
            }, 1000);
        }, 100);
    }
    
    completeChain() {
        this.isRunning = false;
        this.container.classList.add('chain-complete');
        this.chainStory.textContent = "The kindness has come full circle!";
        
        document.getElementById('startChain').innerHTML = '<i class="fas fa-check mr-2"></i>Chain Complete!';
        this.createParticles();
        this.showShareButton();
    }
    
    createParticles() {
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'absolute w-2 h-2 rounded-full';
            particle.style.background = `hsl(${Math.random() * 360}, 100%, 60%)`;
            particle.style.left = '50%';
            particle.style.top = '50%';
            
            this.container.appendChild(particle);
            
            particle.animate([
                { transform: 'translate(0, 0) scale(0)', opacity: 1 },
                { transform: `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(1)`, opacity: 0 }
            ], {
                duration: 1000,
                easing: 'ease-out'
            });
            
            setTimeout(() => particle.remove(), 1000);
        }
    }
    
    // DEBUG: Corrected syntax and added DOM placement
    showShareButton() {
        if (document.getElementById('shareBtn')) return; // Prevent duplicates

        const shareBtn = document.createElement('button');
        shareBtn.id = 'shareBtn';
        shareBtn.className = 'mt-4 bg-blue-500 text-white px-6 py-2 rounded-full font-bold transition-all';
        shareBtn.innerHTML = '<i class="fab fa-twitter mr-2"></i>Share This Kindness Chain';
        
        shareBtn.addEventListener('click', () => {
            alert('Sharing your kindness with the world!');
        });

        this.container.appendChild(shareBtn);
    }
}