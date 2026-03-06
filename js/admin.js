document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('reservation-tbody');
    const emptyMessage = document.getElementById('empty-message');
    const refreshBtn = document.getElementById('refresh-btn');

    // 予約データをLocalStorageから読み込んでテーブルに表示する関数
    function loadReservations() {
        // テーブルをクリア
        tbody.innerHTML = '';

        // LocalStorageからデータ取得
        const reservations = JSON.parse(localStorage.getItem('youandme_reservations')) || [];

        if (reservations.length === 0) {
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';

            // 最新の予約が上に来るようにソート (降順)
            reservations.sort((a, b) => b.id - a.id);

            reservations.forEach(res => {
                const tr = document.createElement('tr');

                // 受付日時のフォーマット
                const createdDate = new Date(res.createdAt);
                const createdFormatted = `${createdDate.getMonth() + 1}/${createdDate.getDate()} ${String(createdDate.getHours()).padStart(2, '0')}:${String(createdDate.getMinutes()).padStart(2, '0')}`;

                // 状態ラベル
                const statusHtml = res.status === 'confirmed'
                    ? `<span class="status-badge status-confirmed">確定済み</span>`
                    : `<span class="status-badge status-new">未確定</span>`;

                // ボタンのラベルと動作
                const actionBtnHtml = res.status === 'confirmed'
                    ? `<button class="btn btn-sm" style="background-color: #e0e0e0; color: #333;" disabled>確定済み</button>`
                    : `<button class="btn btn-sm btn-accent confirm-btn" data-id="${res.id}">予約を確定させる</button>`;

                tr.innerHTML = `
                    <td>${createdFormatted}</td>
                    <td><strong>${res.date}</strong><br>${res.time}</td>
                    <td>${res.name} 様</td>
                    <td>${res.people}名</td>
                    <td><a href="tel:${res.tel}">${res.tel}</a></td>
                    <td><a href="mailto:${res.email}">メール送信</a></td>
                    <td>${statusHtml}</td>
                    <td>${actionBtnHtml}</td>
                `;

                tbody.appendChild(tr);
            });

            // 「確認済にする」ボタンのイベントリスナーを設定
            const confirmBtns = document.querySelectorAll('.confirm-btn');
            confirmBtns.forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = parseInt(this.getAttribute('data-id'), 10);
                    confirmReservation(id);
                });
            });
        }
    }

    // ステータスを「確定済み」に変更する関数
    function confirmReservation(id) {
        if (!confirm('この予約を確定済みにしますか？ (※実際の運用ではここでお客様へ連絡済みのマーカーとして使用します)')) {
            return;
        }

        const reservations = JSON.parse(localStorage.getItem('youandme_reservations')) || [];
        const index = reservations.findIndex(res => res.id === id);

        if (index !== -1) {
            reservations[index].status = 'confirmed';
            localStorage.setItem('youandme_reservations', JSON.stringify(reservations));
            loadReservations(); // 再描画
        }
    }

    // 初回読み込み
    loadReservations();

    // 更新ボタンの動作
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshBtn.textContent = '読み込み中...';
            setTimeout(() => {
                loadReservations();
                refreshBtn.textContent = '最新データを読み込む';
            }, 300); // モック用の疑似的なローディング
        });
    }
});
