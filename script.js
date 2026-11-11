// 獲得済み選手
let selectedPlayers = [];

// 現在の候補
let currentCandidates = [];

// 抽選済みの年度×入団方法
let usedYearTypes = [];

// チームの18枠
const slots = [
    "捕手", "一塁手", "二塁手", "三塁手",
    "遊撃手", "左翼手", "中堅手", "右翼手",
    "DH", "代打", "代走",
    "先発1", "先発2", "先発3",
    "中継ぎ1", "中継ぎ2", "中継ぎ3",
    "抑え"
];

let team = {};

slots.forEach(slot => {
    team[slot] = null;
});

// 現在獲得した選手
let currentPlayer = null;

// 打順（1番〜9番）
let battingOrder = [
    null, null, null,
    null, null, null,
    null, null, null
];

// 抽選開始
function startGame() {

    if (selectedPlayers.length >= 18) {
        showTeam();
        return;
    }

    const available = players.filter(
        p => !selectedPlayers.includes(p.name)
    );

    const availableTypes = ["draft", "other"].filter(type =>
        available.some(p =>
            p.type === type &&
            !usedYearTypes.includes(`${type}-${p.year}`)
        )
    );

    if (availableTypes.length === 0) {
        document.getElementById("result").innerHTML =
            "抽選できる年度がありません。選手データを追加してください。";
        return;
    }

    const type = availableTypes[
        Math.floor(Math.random() * availableTypes.length)
    ];

    const years = [...new Set(
        available
            .filter(p =>
                p.type === type &&
                !usedYearTypes.includes(`${type}-${p.year}`)
            )
            .map(p => p.year)
    )];

    const year = years[Math.floor(Math.random() * years.length)];

    // 抽選した年度×入団方法を記録
    usedYearTypes.push(`${type}-${year}`);

    currentCandidates = available.filter(
        p => p.type === type && p.year === year
    );

    const typeName = type === "draft"
        ? "ドラフト入団"
        : "ドラフト外入団";

    let html = `
        <h2>${typeName}</h2>
        <h1>${year}年</h1>
        <h3>獲得する選手を選んでください</h3>
    `;

    currentCandidates.forEach((p, index) => {
        html += `
            <button onclick="selectPlayer(${index})">
                ${p.name}
            </button>
        `;
    });

    document.getElementById("result").innerHTML = html;
}

// 選手獲得
function selectPlayer(index) {

    const player = currentCandidates[index];

    if (!player || selectedPlayers.includes(player.name)) return;

    currentPlayer = player;
    selectedPlayers.push(player.name);

    let html = `
        <h2>獲得成功！</h2>
        <h1>${player.name}</h1>
        <p>ポジション：${player.positions.join("・")}</p>
        <h3>配置する枠を選んでください</h3>
    `;

    slots.forEach(slot => {
        if (team[slot] === null) {
            html += `
                <button onclick="assignPlayer('${slot}')">
                    ${slot}
                </button>
            `;
        }
    });

    document.getElementById("result").innerHTML = html;
}

// 選手をチームに配置
function assignPlayer(slot) {

    if (team[slot] !== null || !currentPlayer) return;

    team[slot] = currentPlayer.name;
    currentPlayer = null;

    showTeam();
}

// チーム表示
function showTeam() {

    let html = `
        <h2>楽天ドリームチーム</h2>
        <h3>獲得人数：${selectedPlayers.length} / 18</h3>
    `;

    slots.forEach(slot => {
        html += `
            <p>
                <strong>${slot}：</strong>
                ${team[slot] || "未設定"}
            </p>
        `;
    });

    if (selectedPlayers.length < 18) {
        html += `
            <button onclick="startGame()">
                次の選手を獲得
            </button>
        `;
    } else {
    html += `
        <h2>チーム完成！！</h2>
        <button onclick="showBattingOrder()">
            打順を組む！
        </button>
    `;
}

    document.getElementById("result").innerHTML = html;
}
// 打順設定画面
function showBattingOrder() {

    let html = `
        <h2>⚾ 打順設定</h2>
        <p>1番から9番まで選手を設定してください。</p>
    `;

    const batters = [
        "捕手", "一塁手", "二塁手", "三塁手",
        "遊撃手", "左翼手", "中堅手", "右翼手",
        "DH"
    ];

    for (let i = 0; i < 9; i++) {

        html += `<h3>${i + 1}番</h3>`;
        html += `<select id="batting${i}">`;
        html += `<option value="">選手を選択</option>`;

        batters.forEach(slot => {
            const playerName = team[slot];

            if (playerName) {
                html += `
                    <option value="${slot}"
                        ${battingOrder[i] === slot ? "selected" : ""}>
                        ${playerName}（${slot}）
                    </option>
                `;
            }
        });

        html += `</select>`;
    }

    html += `
        <br><br>
        <button onclick="saveBattingOrder()">打順を決定</button>
    `;

    document.getElementById("result").innerHTML = html;
}

// 打順を保存
function saveBattingOrder() {

    const newOrder = [];

    for (let i = 0; i < 9; i++) {
        const slot = document.getElementById(`batting${i}`).value;

        if (!slot) {
            alert("1番から9番まで全て選んでください！");
            return;
        }

        newOrder.push(slot);
    }

    if (new Set(newOrder).size !== 9) {
        alert("同じ選手を複数の打順に設定できません！");
        return;
    }

    battingOrder = newOrder;

    showBattingOrderResult();
}

// 最終チーム一覧表
function showBattingOrderResult() {

    let html = `
        <div id="teamImageArea" style="background:white; padding:20px; color:black;">
            <h2>⚾ 楽天ドリームチーム完成！</h2>

            <h3>スタメン・打順</h3>
            <table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;">
                <tr>
                    <th>打順</th>
                    <th>守備位置</th>
                    <th>選手名</th>
                </tr>
    `;

    battingOrder.forEach((slot, index) => {
        html += `
            <tr>
                <td>${index + 1}番</td>
                <td>${slot}</td>
                <td>${team[slot] || "未設定"}</td>
            </tr>
        `;
    });

    html += `
            </table>

            <h3>控え選手</h3>
            <table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;">
                <tr>
                    <th>役割</th>
                    <th>選手名</th>
                </tr>
                <tr>
                    <td>代打</td>
                    <td>${team["代打"] || "未設定"}</td>
                </tr>
                <tr>
                    <td>代走</td>
                    <td>${team["代走"] || "未設定"}</td>
                </tr>
            </table>

            <h3>投手陣</h3>
            <table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;">
                <tr>
                    <th>役割</th>
                    <th>選手名</th>
                </tr>
    `;

    const pitchers = [
        "先発1", "先発2", "先発3",
        "中継ぎ1", "中継ぎ2", "中継ぎ3",
        "抑え"
    ];

    pitchers.forEach(slot => {
        html += `
            <tr>
                <td>${slot}</td>
                <td>${team[slot] || "未設定"}</td>
            </tr>
        `;
    });

    html += `
            </table>
        </div>

        <br>

        <button onclick="copyTeamImage()">
            📷 チーム表の画像をコピー
        </button>

        <button onclick="showBattingOrder()">
            打順を変更する
        </button>
    `;

    document.getElementById("result").innerHTML = html;
}
async function copyTeamImage() {

    const area = document.getElementById("teamImageArea");

    if (!area) {
        alert("チーム表が見つかりません。");
        return;
    }

    try {
        const canvas = await html2canvas(area, {
            backgroundColor: "#ffffff",
            scale: 2
        });

        const blob = await new Promise(resolve =>
            canvas.toBlob(resolve, "image/png")
        );

        if (!blob) {
            throw new Error("画像を作成できませんでした。");
        }

        await navigator.clipboard.write([
            new ClipboardItem({
                "image/png": blob
            })
        ]);

        alert("チーム表の画像をコピーしました！");

    } catch (error) {
        alert("画像をコピーできませんでした。ブラウザの権限や対応状況を確認してください。");
        console.error(error);
    }
}