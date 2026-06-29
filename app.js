  document.addEventListener('DOMContentLoaded', () => {
      
      // [공통] 토스트 알림 
      const toastPopup = document.getElementById('toast-msg');
      const toastText = document.getElementById('toast-text');
      let toastTimeout;
      const showToast = (message, iconClass = 'ti-check') => {
        toastPopup.innerHTML = `<i class="ti ${iconClass}"></i> <span>${message}</span>`;
        toastPopup.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toastPopup.classList.remove('show'), 2500);
      };

      // [기능 1] 라우팅 및 탭 메모리
      const navItems = document.querySelectorAll('.nav-item');
      const appScreens = document.querySelectorAll('.app-screen');
      
      const savedTab = localStorage.getItem('hc_activeTab') || 'screen-home';

      const switchTab = (targetId) => {
        navItems.forEach(nav => {
          nav.classList.toggle('active', nav.getAttribute('data-target') === targetId);
        });
        appScreens.forEach(screen => {
          if (screen.id === targetId) {
            screen.style.display = 'block';
            setTimeout(() => screen.classList.add('active'), 10);
          } else {
            screen.classList.remove('active');
            screen.style.display = 'none';
          }
        });
        localStorage.setItem('hc_activeTab', targetId);
      };

      // 초기 탭 로드
      switchTab(savedTab);

      // 탭 클릭 이벤트
      navItems.forEach(item => {
        item.addEventListener('click', () => {
          if (item.classList.contains('active')) return;
          switchTab(item.getAttribute('data-target'));
        });
      });

      // [기능 2] 시스템 시계 연동 
      const systemClockSync = () => {
        const timeTarget = document.getElementById('system-clock');
        const d = new Date();
        let h = d.getHours();
        const m = String(d.getMinutes()).padStart(2, '0');
        const p = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12; 
        if(timeTarget) timeTarget.innerText = `${String(h).padStart(2, '0')}:${m} ${p}`;
        
        const homeDate = document.getElementById('home-date');
        if(homeDate) homeDate.innerText = `오늘, ${d.getMonth()+1}월 ${d.getDate()}일`;
      };
      setInterval(systemClockSync, 1000); systemClockSync();

      // [기능 3] 실시간 수분 섭취 인터랙션 
      const waterCard = document.getElementById('water-card');
      const waterText = document.getElementById('water-text');
      const waterPercent = document.getElementById('water-percent');
      const waterBar = document.getElementById('water-bar');
      const MAX_WATER = 2.0;
      
      let currentWater = parseFloat(localStorage.getItem('hc_water')) || 0.0;

      const updateWaterUI = () => {
        waterText.innerText = currentWater.toFixed(1);
        const percent = Math.min(Math.round((currentWater / MAX_WATER) * 100), 100);
        waterPercent.innerText = percent;
        waterBar.style.width = `${percent}%`;
      };
      updateWaterUI(); // 초기화

      waterCard.addEventListener('click', () => {
        if(currentWater >= MAX_WATER) {
          showToast('오늘의 목표 수분을 달성했습니다!', 'ti-medal');
          return;
        }
        currentWater += 0.2;
        localStorage.setItem('hc_water', currentWater.toFixed(1));
        updateWaterUI();
        showToast('수분 0.2L 섭취 기록 완료', 'ti-drop');
      });

      // [기능 4] 식단 기록 및 총 칼로리 연동
      const defaultDiet = [
        { title: '아침 식단', desc: '현미밥, 닭가슴살 샐러드', cal: 540, icon: 'ti-coffee', bg: '#e4eaff', color: 'var(--primary)' }
      ];
      let dietData = JSON.parse(localStorage.getItem('hc_diets')) || defaultDiet;
      const dietListEl = document.getElementById('diet-list');
      const totalCalEl = document.getElementById('total-cal');

      const renderDiets = () => {
        dietListEl.innerHTML = '';
        let totalCalories = 0;

        dietData.forEach(diet => {
          totalCalories += diet.cal;
          const div = document.createElement('div');
          div.className = 'item-row';
          div.innerHTML = `
            <div class="item-icon" style="background:${diet.bg}; color:${diet.color};"><i class="ti ${diet.icon}"></i></div>
            <div class="item-details">
              <h4>${diet.title}</h4><p>${diet.desc}</p>
            </div>
            <span style="font-size:12px; font-weight:700; color:var(--primary);">${diet.cal} kcal</span>
          `;
          dietListEl.appendChild(div);
        });

        // 홈 화면 칼로리 업데이트
        if(totalCalEl) totalCalEl.innerText = totalCalories.toLocaleString();
      };
      renderDiets();

      // AI 카메라 버튼
      const btnAiCamera = document.getElementById('btn-ai-camera');
      btnAiCamera.addEventListener('click', () => {
        btnAiCamera.disabled = true;
        btnAiCamera.innerHTML = `<i class="ti ti-loader ti-spin"></i> AI가 음식을 분석 중입니다...`;
        
        setTimeout(() => {
          const newDiet = {
            title: '점심 식단 <span class="badge" style="background:var(--primary); color:white; padding:2px 6px;">AI</span>', 
            desc: '소고기 쌀국수, 스프링롤 2개', 
            cal: 820, 
            icon: 'ti-tools-kitchen-2', 
            bg: '#fff2e4', 
            color: 'var(--accent-orange)'
          };
          dietData.push(newDiet);
          localStorage.setItem('hc_diets', JSON.stringify(dietData));
          
          renderDiets();
          showToast('식단이 추가되고 칼로리가 업데이트 되었습니다.', 'ti-camera-check');
          
          btnAiCamera.innerHTML = `<i class="ti ti-camera-check"></i> 음식 사진 촬영 AI 자동 분석`;
          btnAiCamera.disabled = false;
        }, 1200);
      });

      // [기능 5] 설정 토글 로컬 스토리지 연동 
      const settingToggles = document.querySelectorAll('.setting-toggle');
      settingToggles.forEach(toggle => {
        const savedState = localStorage.getItem(`hc_toggle_${toggle.id}`);
        if (savedState !== null) toggle.checked = savedState === 'true';
        
        toggle.addEventListener('change', (e) => {
          localStorage.setItem(`hc_toggle_${e.target.id}`, e.target.checked);
          showToast('설정이 저장되었습니다.', 'ti-settings');
        });
      });

      // [기타 인터랙션]
      // 복약 체크
      const medCheckBtn = document.getElementById('med-check-btn');
      medCheckBtn.addEventListener('click', () => {
        medCheckBtn.classList.toggle('active-check');
        showToast(medCheckBtn.classList.contains('active-check') ? '복약 기록 완료' : '기록 취소', 'ti-pill');
      });

      // 데이터 초기화 버튼 (테스트용)
      document.getElementById('btn-reset-data').addEventListener('click', () => {
        if(confirm('테스트 데이터를 모두 초기화하시겠습니까?')) {
          localStorage.clear();
          location.reload();
        }
      });
      
    });