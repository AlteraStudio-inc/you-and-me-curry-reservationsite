document.addEventListener('DOMContentLoaded', () => {
    // ---- 1. 人数セレクトボックスの生成 (1〜20名) ----
    const peopleSelect = document.getElementById('people');
    if (peopleSelect) {
        for (let i = 1; i <= 20; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}名`;
            peopleSelect.appendChild(option);
        }
    }

    // ---- モーダル＆カレンダー関連要素 ----
    const modal = document.getElementById('reservation-modal');
    const openBtns = document.querySelectorAll('.open-modal-btn');
    const closeBtn = document.getElementById('modal-close');

    const stepCalendar = document.getElementById('step-calendar');
    const stepForm = document.getElementById('step-form');
    const stepSuccess = document.getElementById('step-success');

    const calContainer = document.getElementById('calendar-container');
    const calMonthDisplay = document.getElementById('cal-month');
    const btnCalPrev = document.getElementById('cal-prev');
    const btnCalNext = document.getElementById('cal-next');

    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth(); // 0-indexed

    // ---- 2. モーダル開閉処理 ----
    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            // 初回表示は必ずカレンダー（ステップ1）にする
            stepCalendar.style.display = 'block';
            stepForm.style.display = 'none';
            stepSuccess.style.display = 'none';

            generateCalendar(currentYear, currentMonth);
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // 背面のスクロール防止
        });
    });

    closeBtn.addEventListener('click', closeModal);

    // モーダル背景クリックで閉じる
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ---- 3. カレンダーの生成処理 ----
    function generateCalendar(year, month) {
        calMonthDisplay.textContent = `${year}年${String(month + 1).padStart(2, '0')}月`;

        const firstDay = new Date(year, month, 1).getDay(); // 0(Sun) - 6(Sat)
        // 今回の表示は月曜日始まりにする (日本のカレンダー要件：月～日)
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let html = '<table class="calendar-table">';
        html += '<thead><tr><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th><th>日</th></tr></thead>';
        html += '<tbody><tr>';

        let dayCount = 1;

        // 第1週目の空白セル
        for (let i = 0; i < adjustedFirstDay; i++) {
            html += '<td class="calendar-cell disabled"></td>';
        }

        while (dayCount <= daysInMonth) {
            // 改行判定
            const currDayOfWeek = new Date(year, month, dayCount).getDay();
            const adjustedCurrDayOfWeek = currDayOfWeek === 0 ? 6 : currDayOfWeek - 1;

            if (adjustedCurrDayOfWeek === 0 && dayCount !== 1) {
                html += '</tr><tr>';
            }

            const cellDate = new Date(year, month, dayCount);
            const isMonToThu = currDayOfWeek >= 1 && currDayOfWeek <= 4;
            const isFriday = currDayOfWeek === 5;
            const isTuesday = currDayOfWeek === 2;

            let statusClass = 'status-ok';
            let statusChar = '◎';
            let isDisabled = false;
            let pointMark = '';

            // ダミーロジック:
            // 過去日はグレーアウト
            if (cellDate < today) {
                statusChar = '－';
                statusClass = 'status-ng';
                isDisabled = true;
            }
            // 火曜日は定休日
            else if (isTuesday) {
                statusChar = '休';
                statusClass = 'status-ng';
                isDisabled = true;
            } else {
                // 適当に状態を散らすモック
                if (dayCount % 8 === 0) {
                    statusChar = 'TEL';
                    statusClass = 'status-tel';
                } else if (dayCount % 7 === 0) {
                    statusChar = '□';
                    statusClass = 'status-req';
                }


            }

            let cellClass = 'calendar-cell';
            if (isDisabled) cellClass += ' disabled past';

            const formattedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCount).padStart(2, '0')}`;

            html += `<td class="${cellClass}" data-date="${formattedDateStr}" data-disabled="${isDisabled}">
                        <span class="date-num">${dayCount}</span>
                        <span class="status-mark ${statusClass}">${statusChar}</span>
                        ${pointMark}
                     </td>`;

            dayCount++;
        }

        // 最終週の後ろを埋める
        const lastDayOfWeek = new Date(year, month, daysInMonth).getDay();
        const adjustedLastDayOfWeek = lastDayOfWeek === 0 ? 6 : lastDayOfWeek - 1;

        if (adjustedLastDayOfWeek !== 6) {
            for (let i = adjustedLastDayOfWeek; i < 6; i++) {
                html += '<td class="calendar-cell disabled"></td>';
            }
        }

        html += '</tr></tbody></table>';
        calContainer.innerHTML = html;

        // セルクリックのイベント割り当て
        const cells = calContainer.querySelectorAll('.calendar-cell');
        cells.forEach(cell => {
            cell.addEventListener('click', function () {
                if (this.getAttribute('data-disabled') === 'true') return;

                const selectedDateStr = this.getAttribute('data-date');
                if (!selectedDateStr) return;

                // ステップ変更：カレンダー -> フォーム
                const d = new Date(selectedDateStr);
                const dayStr = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
                document.getElementById('selected-date-display').textContent = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${dayStr}）のご予約`;

                document.getElementById('date').value = selectedDateStr;

                stepCalendar.style.display = 'none';
                stepForm.style.display = 'block';
                document.querySelector('.modal-content').scrollTop = 0; // スクロール位置リセット
            });
        });
    }

    // 月切り替えボタン
    btnCalPrev.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentYear, currentMonth);
    });

    btnCalNext.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentYear, currentMonth);
    });

    // 「戻る」ボタン（フォームからカレンダーへ戻る）
    document.getElementById('btn-back-calendar').addEventListener('click', () => {
        stepForm.style.display = 'none';
        stepCalendar.style.display = 'block';
    });


    // ---- 4. フォーム送信処理とバリデーション ----
    const form = document.getElementById('reservation-form');
    const telInput = document.getElementById('tel');
    const telError = document.getElementById('tel-error');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // デフォルトの送信をキャンセル

            // エラー表示のリセット
            telError.style.display = 'none';
            let hasError = false;

            // 電話番号の簡易チェック (ハイフン有無問わず数字とハイフンのみか、桁数が少なすぎないか)
            const telValue = telInput.value.replace(/[━.*‐.*―.*－.*\-.*]/gi, '');
            if (telValue.length < 10) {
                telError.textContent = '正しい電話番号を入力してください';
                telError.style.display = 'block';
                hasError = true;
            }

            if (hasError) {
                return; // エラーがあれば送信処理を中断
            }

            const genderInput = document.querySelector('input[name="gender"]:checked');
            const genderValue = genderInput ? genderInput.value : '未選択';

            // ---- 予約データのオブジェクト作成 ----
            const reservationData = {
                id: Date.now(),
                name: document.getElementById('name').value,
                gender: genderValue,
                tel: document.getElementById('tel').value,
                email: document.getElementById('email').value || '未入力', // 任意のため空の場合は未入力とする
                date: document.getElementById('date').value,
                time: document.getElementById('time').value,
                people: document.getElementById('people').value,
                status: 'new', // new (未確認), confirmed (確認済み)
                createdAt: new Date().toISOString()
            };

            // ---- LocalStorage への保存 ----
            let reservations = JSON.parse(localStorage.getItem('youandme_reservations')) || [];
            reservations.push(reservationData);
            localStorage.setItem('youandme_reservations', JSON.stringify(reservations));

            // ---- 送信完了UIの表示 (ステップ3) ----
            stepForm.style.display = 'none';
            stepSuccess.style.display = 'block';
            document.querySelector('.modal-content').scrollTop = 0; // スクロール位置リセット

            console.log('予約データが送信・保存されました:', reservationData);
        });
    }

    // 完了画面の「閉じる」ボタン
    const btnCloseSuccess = document.getElementById('btn-close-success');
    if (btnCloseSuccess) {
        btnCloseSuccess.addEventListener('click', () => {
            closeModal();
            // フォームのリセット
            if (form) form.reset();
        });
    }
});
