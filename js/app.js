/* ===============================================
   Fitness Tracker Pro - AI Powered JavaScript
   =============================================== */

class FitnessTrackerApp {
    constructor() {
        this.profile = this.loadProfile();
        this.dailyData = this.loadDailyData();
        this.achievements = this.loadAchievements();
        
        this.charts = {
            water: null,
            activity: null,
            weight: null,
            workoutFrequency: null
        };
        
        this.init();
    }
    
    // ============== INITIALIZATION ==============
    init() {
        console.log('✅ Fitness Tracker Pro initialized');
        this.setupEventListeners();
        this.renderProfile();
        this.setDefaultDate();
        this.updateTodaySummary();
        this.renderHistoryTable();
        this.initializeCharts();
        this.renderAchievements();
        this.updateHeaderStats();
        this.updateWeightTracking();
        this.updateWorkoutStats();
    }
    
    setupEventListeners() {
        // Profile form
        document.getElementById('editProfileBtn').addEventListener('click', () => this.toggleProfileEdit());
        document.getElementById('cancelProfileBtn').addEventListener('click', () => this.toggleProfileEdit());
        document.getElementById('profileForm').addEventListener('submit', (e) => this.saveProfile(e));
        
        // Daily tracker form
        document.getElementById('dailyTrackerForm').addEventListener('submit', (e) => this.saveDailyData(e));
        document.getElementById('trackerDate').addEventListener('change', () => this.updateTodaySummary());
        
        // History filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterHistory(e.target.dataset.filter));
        });
    }
    
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('trackerDate').value = today;
    }
    
    // ============== PROFILE MANAGEMENT ==============
    loadProfile() {
        const saved = localStorage.getItem('fitnessProfile');
        return saved ? JSON.parse(saved) : null;
    }
    
    saveProfileData(profile) {
        localStorage.setItem('fitnessProfile', JSON.stringify(profile));
        this.profile = profile;
    }
    
    toggleProfileEdit() {
        const display = document.getElementById('profileDisplay');
        const form = document.getElementById('profileForm');
        
        if (form.style.display === 'none') {
            display.style.display = 'none';
            form.style.display = 'block';
            
            if (this.profile) {
                document.getElementById('userName').value = this.profile.name;
                document.getElementById('userAge').value = this.profile.age;
                document.getElementById('userHeight').value = this.profile.height;
                document.getElementById('userWeight').value = this.profile.weight;
                document.getElementById('userGoalWeight').value = this.profile.goalWeight;
                document.getElementById('fitnessGoal').value = this.profile.goal;
                document.getElementById('activityLevel').value = this.profile.activityLevel;
            }
        } else {
            display.style.display = 'block';
            form.style.display = 'none';
        }
    }
    
    saveProfile(e) {
        e.preventDefault();
        
        const profile = {
            name: document.getElementById('userName').value,
            age: parseInt(document.getElementById('userAge').value),
            height: parseInt(document.getElementById('userHeight').value),
            weight: parseFloat(document.getElementById('userWeight').value),
            goalWeight: parseFloat(document.getElementById('userGoalWeight').value),
            goal: document.getElementById('fitnessGoal').value,
            activityLevel: document.getElementById('activityLevel').value,
            createdAt: this.profile?.createdAt || Date.now()
        };
        
        this.saveProfileData(profile);
        this.renderProfile();
        this.toggleProfileEdit();
        this.showNotification('✅ Профиль сохранён!', 'success');
        this.updateWeightTracking();
    }
    
    renderProfile() {
        if (!this.profile) {
            document.getElementById('displayName').textContent = 'Не заполнено';
            document.getElementById('displayAge').textContent = '-';
            document.getElementById('displayHeight').textContent = '-';
            document.getElementById('displayWeight').textContent = '-';
            document.getElementById('displayGoalWeight').textContent = '-';
            document.getElementById('displayGoal').textContent = '-';
            document.getElementById('displayActivity').textContent = '-';
            document.getElementById('displayBMI').textContent = '-';
            return;
        }
        
        const goalNames = {
            'weight_loss': 'Похудение',
            'muscle_gain': 'Набор массы',
            'maintenance': 'Поддержание формы',
            'endurance': 'Выносливость'
        };
        
        const activityNames = {
            'low': 'Низкая',
            'medium': 'Средняя',
            'high': 'Высокая'
        };
        
        const bmi = (this.profile.weight / Math.pow(this.profile.height / 100, 2)).toFixed(1);
        
        document.getElementById('displayName').textContent = this.profile.name;
        document.getElementById('displayAge').textContent = `${this.profile.age} лет`;
        document.getElementById('displayHeight').textContent = `${this.profile.height} см`;
        document.getElementById('displayWeight').textContent = `${this.profile.weight} кг`;
        document.getElementById('displayGoalWeight').textContent = `${this.profile.goalWeight} кг`;
        document.getElementById('displayGoal').textContent = goalNames[this.profile.goal] || this.profile.goal;
        document.getElementById('displayActivity').textContent = activityNames[this.profile.activityLevel] || this.profile.activityLevel;
        document.getElementById('displayBMI').textContent = bmi;
    }
    
    // ============== DAILY DATA MANAGEMENT ==============
    loadDailyData() {
        const saved = localStorage.getItem('dailyData');
        return saved ? JSON.parse(saved) : [];
    }
    
    saveDailyDataToStorage() {
        localStorage.setItem('dailyData', JSON.stringify(this.dailyData));
    }
    
    saveDailyData(e) {
        e.preventDefault();
        
        const date = document.getElementById('trackerDate').value;
        const weight = parseFloat(document.getElementById('currentWeight').value);
        const water = parseInt(document.getElementById('waterIntake').value);
        const food = document.getElementById('foodLog').value;
        const calories = parseInt(document.getElementById('caloriesEstimate').value);
        const steps = parseInt(document.getElementById('stepsCount').value);
        const activityMinutes = parseInt(document.getElementById('activityMinutes').value);
        
        // Workout data
        const workoutName = document.getElementById('workoutName').value;
        const workoutDuration = parseInt(document.getElementById('workoutDuration').value) || 0;
        const workoutIntensity = document.getElementById('workoutIntensity').value;
        const workoutCalories = parseInt(document.getElementById('workoutCalories').value) || 0;
        
        const workout = workoutName ? {
            name: workoutName,
            duration: workoutDuration,
            intensity: workoutIntensity,
            calories: workoutCalories
        } : null;
        
        // Remove existing entry for this date
        this.dailyData = this.dailyData.filter(item => item.date !== date);
        
        // Add new entry
        this.dailyData.push({
            date,
            weight,
            water,
            food,
            calories,
            steps,
            activityMinutes,
            workout,
            timestamp: Date.now()
        });
        
        // Sort by date descending
        this.dailyData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        this.saveDailyDataToStorage();
        this.showNotification('✅ Данные сохранены!', 'success');
        
        // Update UI
        this.updateTodaySummary();
        this.renderHistoryTable();
        this.updateCharts();
        this.checkAchievements();
        this.updateHeaderStats();
        this.updateWeightTracking();
        this.updateWorkoutStats();
        
        // Generate AI recommendations
        this.generateAIRecommendations({ date, weight, water, food, calories, steps, activityMinutes, workout });
        
        // Clear workout fields but keep other fields
        document.getElementById('workoutName').value = '';
        document.getElementById('workoutDuration').value = '';
        document.getElementById('workoutIntensity').value = '';
        document.getElementById('workoutCalories').value = '';
    }
    
    updateTodaySummary() {
        const date = document.getElementById('trackerDate').value;
        const todayData = this.dailyData.find(item => item.date === date);
        const summaryDiv = document.getElementById('todaySummary');
        
        if (!todayData) {
            summaryDiv.innerHTML = '<p class="empty-state">Данные не добавлены</p>';
            return;
        }
        
        let html = `
            <div class="summary-item">
                <span>Вес:</span>
                <strong>${todayData.weight} кг</strong>
            </div>
            <div class="summary-item">
                <span>Вода:</span>
                <strong>${todayData.water} мл</strong>
            </div>
            <div class="summary-item">
                <span>Калории:</span>
                <strong>${todayData.calories} ккал</strong>
            </div>
            <div class="summary-item">
                <span>Шаги:</span>
                <strong>${todayData.steps}</strong>
            </div>
            <div class="summary-item">
                <span>Активность:</span>
                <strong>${todayData.activityMinutes} мин</strong>
            </div>
        `;
        
        if (todayData.workout) {
            html += `
                <div class="summary-item">
                    <span>Тренировка:</span>
                    <strong>${todayData.workout.name}</strong>
                </div>
            `;
        }
        
        summaryDiv.innerHTML = html;
    }
    
    // ============== AI RECOMMENDATIONS ==============
    generateAIRecommendations(data) {
        if (!this.profile) {
            return;
        }
        
        const section = document.getElementById('aiRecommendations');
        const content = document.getElementById('recommendationsContent');
        
        section.style.display = 'block';
        
        let recommendations = [];
        
        // Water analysis
        const waterGoal = 2000; // ml
        const waterDiff = waterGoal - data.water;
        
        if (data.water >= waterGoal) {
            recommendations.push({
                type: 'success',
                icon: 'fa-tint',
                title: '💧 Вода - Отлично!',
                text: `Вы выпили ${data.water} мл воды. Цель достигнута! Продолжайте в том же духе.`,
                tips: []
            });
        } else if (data.water >= waterGoal * 0.7) {
            recommendations.push({
                type: 'warning',
                icon: 'fa-tint',
                title: '💧 Вода - Хорошо',
                text: `Вы выпили ${data.water} мл из ${waterGoal} мл. Осталось ${waterDiff} мл до цели.`,
                tips: [`Завтра постарайтесь выпить хотя бы ${waterGoal} мл воды`]
            });
        } else {
            recommendations.push({
                type: 'danger',
                icon: 'fa-tint',
                title: '💧 Вода - Требует внимания',
                text: `Вы выпили только ${data.water} мл. Это меньше нормы на ${waterDiff} мл.`,
                tips: [
                    `Завтра обязательно выпейте минимум ${waterGoal} мл воды`,
                    'Поставьте напоминания каждый час',
                    'Держите бутылку воды всегда под рукой'
                ]
            });
        }
        
        // Calorie analysis based on goal
        const calorieRecommendations = this.getCalorieRecommendations(data.calories);
        recommendations.push(calorieRecommendations);
        
        // Activity analysis
        const activityRecommendation = this.getActivityRecommendations(data.steps, data.activityMinutes);
        recommendations.push(activityRecommendation);
        
        // Food suggestions
        const foodRecommendation = this.getFoodRecommendations();
        recommendations.push(foodRecommendation);
        
        // Tomorrow's plan
        const tomorrowPlan = this.getTomorrowPlan(data);
        
        // Render recommendations
        let html = '';
        
        recommendations.forEach(rec => {
            html += `
                <div class="recommendation-card ${rec.type}">
                    <div class="recommendation-header">
                        <i class="fas ${rec.icon}"></i>
                        <h3>${rec.title}</h3>
                    </div>
                    <p>${rec.text}</p>
                    ${rec.tips.length > 0 ? `
                        <ul style="margin: 0.5rem 0 0 1.5rem; color: var(--text-secondary);">
                            ${rec.tips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `;
        });
        
        html += `
            <div class="tomorrow-plan">
                <h4><i class="fas fa-calendar-day"></i> План на завтра</h4>
                <ul>
                    ${tomorrowPlan.map(item => `<li><i class="fas fa-check"></i> ${item}</li>`).join('')}
                </ul>
            </div>
        `;
        
        content.innerHTML = html;
        
        // Scroll to recommendations
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    getCalorieRecommendations(calories) {
        if (!this.profile) {
            return {
                type: 'info',
                icon: 'fa-fire-alt',
                title: '🔥 Калории',
                text: `Вы потребили ${calories} ккал сегодня.`,
                tips: []
            };
        }
        
        const bmr = this.calculateBMR();
        const tdee = this.calculateTDEE(bmr);
        
        let targetCalories = tdee;
        let recommendation = {};
        
        switch(this.profile.goal) {
            case 'weight_loss':
                targetCalories = tdee - 500; // 500 kcal deficit
                if (calories <= targetCalories) {
                    recommendation = {
                        type: 'success',
                        icon: 'fa-fire-alt',
                        title: '🔥 Калории - Отлично!',
                        text: `Вы потребили ${calories} ккал. Для похудения ваша цель ${targetCalories} ккал. Вы в целевом диапазоне!`,
                        tips: ['Продолжайте в том же духе', 'Следите за балансом белков, жиров и углеводов']
                    };
                } else {
                    const excess = calories - targetCalories;
                    recommendation = {
                        type: 'warning',
                        icon: 'fa-fire-alt',
                        title: '🔥 Калории - Превышение',
                        text: `Вы потребили ${calories} ккал, что на ${excess} ккал больше цели для похудения (${targetCalories} ккал).`,
                        tips: [
                            `Завтра постарайтесь ограничиться ${targetCalories} ккал`,
                            'Уменьшите порции на 20%',
                            'Избегайте сладкого и жирного',
                            'Добавьте больше овощей и белка'
                        ]
                    };
                }
                break;
                
            case 'muscle_gain':
                targetCalories = tdee + 300; // 300 kcal surplus
                if (calories >= targetCalories) {
                    recommendation = {
                        type: 'success',
                        icon: 'fa-fire-alt',
                        title: '🔥 Калории - Отлично!',
                        text: `Вы потребили ${calories} ккал. Для набора массы ваша цель ${targetCalories} ккал. Цель достигнута!`,
                        tips: ['Убедитесь, что потребляете 2г белка на кг веса', 'Ешьте каждые 3-4 часа']
                    };
                } else {
                    const deficit = targetCalories - calories;
                    recommendation = {
                        type: 'warning',
                        icon: 'fa-fire-alt',
                        title: '🔥 Калории - Недобор',
                        text: `Вы потребили ${calories} ккал, что на ${deficit} ккал меньше цели для набора массы (${targetCalories} ккал).`,
                        tips: [
                            `Завтра постарайтесь съесть ${targetCalories} ккал`,
                            'Добавьте перекус с орехами или протеиновым коктейлем',
                            'Увеличьте порции на 15-20%',
                            'Ешьте больше сложных углеводов и белка'
                        ]
                    };
                }
                break;
                
            case 'maintenance':
                if (Math.abs(calories - tdee) <= 200) {
                    recommendation = {
                        type: 'success',
                        icon: 'fa-fire-alt',
                        title: '🔥 Калории - Идеально!',
                        text: `Вы потребили ${calories} ккал. Для поддержания формы ваша норма ${Math.round(tdee)} ккал. Отличный баланс!`,
                        tips: ['Поддерживайте этот уровень', 'Следите за качеством пищи']
                    };
                } else if (calories > tdee + 200) {
                    recommendation = {
                        type: 'warning',
                        icon: 'fa-fire-alt',
                        title: '🔥 Калории - Превышение',
                        text: `Вы потребили ${calories} ккал, что выше нормы для поддержания веса (${Math.round(tdee)} ккал).`,
                        tips: [`Завтра уменьшите калорийность до ${Math.round(tdee)} ккал`, 'Добавьте дополнительную активность']
                    };
                } else {
                    recommendation = {
                        type: 'info',
                        icon: 'fa-fire-alt',
                        title: '🔥 Калории - Небольшой дефицит',
                        text: `Вы потребили ${calories} ккал. Норма для поддержания ${Math.round(tdee)} ккал.`,
                        tips: [`Завтра постарайтесь съесть около ${Math.round(tdee)} ккал`]
                    };
                }
                break;
                
            default:
                recommendation = {
                    type: 'info',
                    icon: 'fa-fire-alt',
                    title: '🔥 Калории',
                    text: `Вы потребили ${calories} ккал сегодня.`,
                    tips: []
                };
        }
        
        return recommendation;
    }
    
    getActivityRecommendations(steps, minutes) {
        const stepsGoal = 10000;
        const minutesGoal = 30;
        
        if (steps >= stepsGoal && minutes >= minutesGoal) {
            return {
                type: 'success',
                icon: 'fa-running',
                title: '👟 Активность - Превосходно!',
                text: `Вы прошли ${steps.toLocaleString()} шагов и были активны ${minutes} минут. Все цели достигнуты!`,
                tips: ['Вы молодец! Так держать!', 'Отличная работа сегодня!']
            };
        } else if (steps >= stepsGoal * 0.7 || minutes >= minutesGoal * 0.7) {
            return {
                type: 'warning',
                icon: 'fa-running',
                title: '👟 Активность - Хорошо',
                text: `Вы прошли ${steps.toLocaleString()} шагов и были активны ${minutes} минут.`,
                tips: [
                    steps < stepsGoal ? `Завтра постарайтесь пройти хотя бы ${stepsGoal.toLocaleString()} шагов` : '',
                    minutes < minutesGoal ? `Добавьте ${minutesGoal - minutes} минут активности` : ''
                ].filter(Boolean)
            };
        } else {
            return {
                type: 'danger',
                icon: 'fa-running',
                title: '👟 Активность - Низкая',
                text: `Вы прошли только ${steps.toLocaleString()} шагов и были активны ${minutes} минут. Это значительно ниже рекомендуемого.`,
                tips: [
                    `Завтра постарайтесь пройти минимум ${stepsGoal.toLocaleString()} шагов`,
                    'Сделайте утреннюю зарядку 15 минут',
                    'Прогуляйтесь в обеденный перерыв',
                    'Используйте лестницу вместо лифта'
                ]
            };
        }
    }
    
    getFoodRecommendations() {
        if (!this.profile) {
            return {
                type: 'info',
                icon: 'fa-utensils',
                title: '🥗 Питание',
                text: 'Следите за балансом питательных веществ.',
                tips: []
            };
        }
        
        const tips = [];
        
        switch(this.profile.goal) {
            case 'weight_loss':
                tips.push('Увеличьте потребление белка (курица, рыба, яйца)');
                tips.push('Добавьте больше овощей и клетчатки');
                tips.push('Сократите простые углеводы (сахар, белый хлеб)');
                tips.push('Пейте воду перед едой');
                break;
                
            case 'muscle_gain':
                tips.push('Ешьте 2г белка на кг веса (мясо, творог, протеин)');
                tips.push('Добавьте сложные углеводы (рис, гречка, овсянка)');
                tips.push('Не забывайте про полезные жиры (орехи, авокадо)');
                tips.push('Ешьте 5-6 раз в день небольшими порциями');
                break;
                
            case 'maintenance':
                tips.push('Поддерживайте баланс белков, жиров и углеводов');
                tips.push('Ешьте разнообразную пищу');
                tips.push('Избегайте переедания');
                tips.push('Следите за размером порций');
                break;
                
            default:
                tips.push('Следите за балансом питательных веществ');
        }
        
        return {
            type: 'info',
            icon: 'fa-utensils',
            title: '🥗 Рекомендации по питанию',
            text: 'Советы на основе вашей цели:',
            tips: tips
        };
    }
    
    getTomorrowPlan(data) {
        const plan = [];
        
        // Water
        if (data.water < 2000) {
            plan.push('💧 Выпить минимум 2000 мл воды');
        } else {
            plan.push('💧 Продолжить пить 2000+ мл воды');
        }
        
        // Calories
        if (this.profile) {
            const bmr = this.calculateBMR();
            const tdee = this.calculateTDEE(bmr);
            let targetCalories = tdee;
            
            if (this.profile.goal === 'weight_loss') {
                targetCalories = tdee - 500;
                plan.push(`🔥 Потребить ${Math.round(targetCalories)} ккал (дефицит для похудения)`);
            } else if (this.profile.goal === 'muscle_gain') {
                targetCalories = tdee + 300;
                plan.push(`🔥 Потребить ${Math.round(targetCalories)} ккал (профицит для роста)`);
            } else {
                plan.push(`🔥 Потребить около ${Math.round(tdee)} ккал (поддержание)`);
            }
        }
        
        // Steps
        if (data.steps < 10000) {
            plan.push('👟 Пройти минимум 10,000 шагов');
        } else {
            plan.push('👟 Поддержать активность 10,000+ шагов');
        }
        
        // Workout
        if (!data.workout) {
            plan.push('💪 Провести тренировку минимум 30 минут');
        } else {
            plan.push('💪 Продолжить регулярные тренировки');
        }
        
        return plan;
    }
    
    calculateBMR() {
        if (!this.profile) return 0;
        
        // Mifflin-St Jeor Formula
        // For simplicity, assuming male formula (you can add gender to profile later)
        const bmr = 10 * this.profile.weight + 6.25 * this.profile.height - 5 * this.profile.age + 5;
        return Math.round(bmr);
    }
    
    calculateTDEE(bmr) {
        if (!this.profile) return 0;
        
        const multipliers = {
            'low': 1.2,
            'medium': 1.55,
            'high': 1.725
        };
        
        return Math.round(bmr * (multipliers[this.profile.activityLevel] || 1.2));
    }
    
    // ============== WEIGHT TRACKING ==============
    updateWeightTracking() {
        if (!this.profile || this.dailyData.length === 0) {
            document.getElementById('startWeight').textContent = '-';
            document.getElementById('currentWeightDisplay').textContent = '-';
            document.getElementById('goalWeightDisplay').textContent = '-';
            document.getElementById('weightChange').textContent = '-';
            return;
        }
        
        // Get weight data sorted by date
        const weightData = this.dailyData
            .filter(d => d.weight)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (weightData.length === 0) {
            return;
        }
        
        const startWeight = weightData[0].weight;
        const currentWeight = weightData[weightData.length - 1].weight;
        const goalWeight = this.profile.goalWeight;
        const change = currentWeight - startWeight;
        
        document.getElementById('startWeight').textContent = `${startWeight} кг`;
        document.getElementById('currentWeightDisplay').textContent = `${currentWeight} кг`;
        document.getElementById('goalWeightDisplay').textContent = `${goalWeight} кг`;
        
        const arrow = change < 0 ? '↓' : change > 0 ? '↑' : '→';
        const color = change < 0 ? '#10b981' : change > 0 ? '#ef4444' : '#94a3b8';
        document.getElementById('weightChange').innerHTML = `<span style="color: ${color}">${arrow} ${Math.abs(change).toFixed(1)} кг</span>`;
        
        // Update weight chart
        this.updateWeightChart();
    }
    
    updateWeightChart() {
        const canvas = document.getElementById('weightChart');
        if (!canvas) return;
        
        const weightData = this.dailyData
            .filter(d => d.weight)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-30); // Last 30 days
        
        if (weightData.length === 0) {
            return;
        }
        
        const labels = weightData.map(d => {
            const date = new Date(d.date);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        });
        
        const weights = weightData.map(d => d.weight);
        
        const goalLine = this.profile ? Array(weights.length).fill(this.profile.goalWeight) : [];
        
        if (this.charts.weight) {
            this.charts.weight.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        this.charts.weight = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Вес (кг)',
                        data: weights,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Цель (кг)',
                        data: goalLine,
                        borderColor: '#10b981',
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        borderWidth: 2,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#f1f5f9' }
                    }
                },
                scales: {
                    y: {
                        ticks: { color: '#cbd5e1' },
                        grid: { color: 'rgba(203, 213, 225, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#cbd5e1' },
                        grid: { color: 'rgba(203, 213, 225, 0.1)' }
                    }
                }
            }
        });
    }
    
    // ============== WORKOUT STATISTICS ==============
    updateWorkoutStats() {
        const workouts = this.dailyData.filter(d => d.workout).map(d => d.workout);
        
        const totalWorkouts = workouts.length;
        const totalTime = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
        
        document.getElementById('totalWorkouts').textContent = totalWorkouts;
        document.getElementById('totalWorkoutTime').textContent = totalTime;
        document.getElementById('totalWorkoutCalories').textContent = totalCalories;
        
        this.updateWorkoutFrequencyChart();
    }
    
    updateWorkoutFrequencyChart() {
        const canvas = document.getElementById('workoutFrequencyChart');
        if (!canvas) return;
        
        // Get last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }
        
        const workoutCounts = last7Days.map(date => {
            const dayData = this.dailyData.find(d => d.date === date);
            return dayData && dayData.workout ? 1 : 0;
        });
        
        const labels = last7Days.map(date => {
            const d = new Date(date);
            return `${d.getDate()}/${d.getMonth() + 1}`;
        });
        
        if (this.charts.workoutFrequency) {
            this.charts.workoutFrequency.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        this.charts.workoutFrequency = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Тренировки',
                    data: workoutCounts,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#f1f5f9' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        ticks: { 
                            color: '#cbd5e1',
                            stepSize: 1
                        },
                        grid: { color: 'rgba(203, 213, 225, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#cbd5e1' },
                        grid: { color: 'rgba(203, 213, 225, 0.1)' }
                    }
                }
            }
        });
    }
    
    // ============== CHARTS ==============
    initializeCharts() {
        this.updateWaterChart();
        this.updateActivityChart();
        this.updateWeightChart();
        this.updateWorkoutFrequencyChart();
    }
    
    updateCharts() {
        this.updateWaterChart();
        this.updateActivityChart();
        this.updateWeightChart();
        this.updateWorkoutFrequencyChart();
    }
    
    updateWaterChart() {
        const canvas = document.getElementById('waterChart');
        if (!canvas) return;
        
        // Get last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }
        
        const waterData = last7Days.map(date => {
            const dayData = this.dailyData.find(d => d.date === date);
            return dayData ? dayData.water : 0;
        });
        
        const labels = last7Days.map(date => {
            const d = new Date(date);
            return `${d.getDate()}/${d.getMonth() + 1}`;
        });
        
        if (this.charts.water) {
            this.charts.water.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        this.charts.water = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Вода (мл)',
                    data: waterData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#f1f5f9' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#cbd5e1' },
                        grid: { color: 'rgba(203, 213, 225, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#cbd5e1' },
                        grid: { color: 'rgba(203, 213, 225, 0.1)' }
                    }
                }
            }
        });
    }
    
    updateActivityChart() {
        const canvas = document.getElementById('activityChart');
        if (!canvas) return;
        
        // Get last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }
        
        const activityData = last7Days.map(date => {
            const dayData = this.dailyData.find(d => d.date === date);
            return dayData ? dayData.activityMinutes : 0;
        });
        
        const labels = last7Days.map(date => {
            const d = new Date(date);
            return `${d.getDate()}/${d.getMonth() + 1}`;
        });
        
        if (this.charts.activity) {
            this.charts.activity.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        this.charts.activity = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Активность (мин)',
                    data: activityData,
                    backgroundColor: 'rgba(139, 92, 246, 0.8)',
                    borderColor: '#8b5cf6',
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#f1f5f9' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#cbd5e1' },
                        grid: { color: 'rgba(203, 213, 225, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#cbd5e1' },
                        grid: { color: 'rgba(203, 213, 225, 0.1)' }
                    }
                }
            }
        });
    }
    
    // ============== ACHIEVEMENTS ==============
    loadAchievements() {
        const saved = localStorage.getItem('achievements');
        return saved ? JSON.parse(saved) : {};
    }
    
    saveAchievements() {
        localStorage.setItem('achievements', JSON.stringify(this.achievements));
    }
    
    checkAchievements() {
        const newAchievements = [];
        
        // 3 days streak
        if (!this.achievements['streak_3'] && this.getStreak() >= 3) {
            this.achievements['streak_3'] = true;
            newAchievements.push('🔥 3 дня подряд!');
        }
        
        // 5 workouts
        const workoutCount = this.dailyData.filter(d => d.workout).length;
        if (!this.achievements['workouts_5'] && workoutCount >= 5) {
            this.achievements['workouts_5'] = true;
            newAchievements.push('💪 5 тренировок!');
        }
        
        // 7 days water goal
        const waterGoalDays = this.dailyData.filter(d => d.water >= 2000).length;
        if (!this.achievements['water_7'] && waterGoalDays >= 7) {
            this.achievements['water_7'] = true;
            newAchievements.push('💧 Норма воды 7 дней!');
        }
        
        // 14 days consistency
        if (!this.achievements['consistency_14'] && this.dailyData.length >= 14) {
            this.achievements['consistency_14'] = true;
            newAchievements.push('🎯 2 недели постоянства!');
        }
        
        // 100k steps
        const totalSteps = this.dailyData.reduce((sum, d) => sum + d.steps, 0);
        if (!this.achievements['steps_100k'] && totalSteps >= 100000) {
            this.achievements['steps_100k'] = true;
            newAchievements.push('👟 100,000 шагов!');
        }
        
        // 30 hours activity
        const totalMinutes = this.dailyData.reduce((sum, d) => sum + d.activityMinutes, 0);
        if (!this.achievements['activity_30h'] && totalMinutes >= 1800) {
            this.achievements['activity_30h'] = true;
            newAchievements.push('⏱️ 30 часов активности!');
        }
        
        if (newAchievements.length > 0) {
            this.saveAchievements();
            this.renderAchievements();
            this.showNotification('🏆 Новое достижение: ' + newAchievements.join(', '), 'success');
            this.updateHeaderStats();
        }
    }
    
    renderAchievements() {
        const grid = document.getElementById('achievementsGrid');
        
        const achievements = [
            { id: 'streak_3', icon: 'fa-fire', title: '3 дня подряд', desc: 'Заполните трекер 3 дня подряд' },
            { id: 'workouts_5', icon: 'fa-dumbbell', title: '5 тренировок', desc: 'Выполните 5 тренировок' },
            { id: 'water_7', icon: 'fa-tint', title: 'Норма воды', desc: 'Выпейте 2L+ воды 7 дней' },
            { id: 'consistency_14', icon: 'fa-calendar-check', title: '2 недели', desc: 'Заполняйте трекер 14 дней' },
            { id: 'steps_100k', icon: 'fa-walking', title: '100,000 шагов', desc: 'Пройдите 100к шагов всего' },
            { id: 'activity_30h', icon: 'fa-clock', title: '30 часов', desc: 'Будьте активны 30 часов всего' }
        ];
        
        let html = '';
        
        achievements.forEach(ach => {
            const unlocked = this.achievements[ach.id];
            html += `
                <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                    <i class="fas ${ach.icon}"></i>
                    <h3>${ach.title}</h3>
                    <p>${ach.desc}</p>
                    ${unlocked ? '<span class="achievement-badge">Разблокировано</span>' : ''}
                </div>
            `;
        });
        
        grid.innerHTML = html;
    }
    
    getStreak() {
        if (this.dailyData.length === 0) return 0;
        
        const sortedDates = this.dailyData
            .map(d => d.date)
            .sort((a, b) => new Date(b) - new Date(a));
        
        let streak = 1;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lastDate = new Date(sortedDates[0]);
        lastDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
            return 0;
        }
        
        for (let i = 0; i < sortedDates.length - 1; i++) {
            const current = new Date(sortedDates[i]);
            const next = new Date(sortedDates[i + 1]);
            
            const diff = Math.floor((current - next) / (1000 * 60 * 60 * 24));
            
            if (diff === 1) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }
    
    // ============== HISTORY TABLE ==============
    renderHistoryTable(filter = 'week') {
        const tbody = document.getElementById('historyTableBody');
        
        if (this.dailyData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Нет данных</td></tr>';
            return;
        }
        
        let filteredData = [...this.dailyData];
        
        if (filter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filteredData = filteredData.filter(d => new Date(d.date) >= weekAgo);
        } else if (filter === 'month') {
            const monthAgo = new Date();
            monthAgo.setDate(monthAgo.getDate() - 30);
            filteredData = filteredData.filter(d => new Date(d.date) >= monthAgo);
        }
        
        let html = '';
        
        filteredData.forEach(data => {
            const date = new Date(data.date);
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            
            html += `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${data.weight} кг</td>
                    <td>${data.water} мл</td>
                    <td>${data.calories} ккал</td>
                    <td>${data.steps.toLocaleString()}</td>
                    <td>${data.activityMinutes} мин</td>
                    <td>${data.workout ? data.workout.name : '-'}</td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
    }
    
    filterHistory(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        event.target.classList.add('active');
        this.renderHistoryTable(filter);
    }
    
    // ============== HEADER STATS ==============
    updateHeaderStats() {
        const streak = this.getStreak();
        const achievementCount = Object.values(this.achievements).filter(Boolean).length;
        
        document.getElementById('headerStreak').textContent = streak;
        document.getElementById('headerAchievements').textContent = achievementCount;
    }
    
    // ============== NOTIFICATIONS ==============
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fitnessApp = new FitnessTrackerApp();
});