
let chart;

async function fetchStatus() {
    try {
        const response = await fetch("/api/status");
        const data = await response.json();
        updateServerList(data);
        updateChart(data);
    } catch (error) {
        console.error("Error fetching status:", error);
    }
}

function updateServerList(servers) {
    const statusList = document.getElementById("server-status");
    statusList.innerHTML = "";
    
    servers.forEach(server => {
        const listItem = document.createElement("li");
        listItem.className = `server-item ${server.alive ? "active" : "inactive"}`;
        listItem.innerHTML = `
            <strong>${server.host}</strong><br>
            Status: ${server.alive ? "Active" : "Inactive"}<br>
            Response Time: ${server.time}ms<br>
            Last Checked: ${new Date(server.lastChecked).toLocaleString()}
        `;
        statusList.appendChild(listItem);
    });
}

function updateChart(servers) {
    const ctx = document.getElementById("responseTimeChart").getContext("2d");
    
    if (chart) {
        chart.destroy();
    }
    
    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: servers.map(s => s.host),
            datasets: [{
                label: "Response Time (ms)",
                data: servers.map(s => s.time),
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

document.getElementById("host-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const hostInput = document.getElementById("host-input");
    const host = hostInput.value.trim();
    
    if (host) {
        try {
            const response = await fetch("/api/hosts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ host })
            });
            
            if (response.ok) {
                hostInput.value = "";
                fetchStatus();
            }
        } catch (error) {
            console.error("Error adding host:", error);
        }
    }
});

fetchStatus();
setInterval(fetchStatus, 5000);

let currentFilter = 'all';

// Refresh button
document.getElementById('refresh-btn').addEventListener('click', () => {
    const button = document.getElementById('refresh-btn');
    button.style.transform = 'rotate(360deg)';
    fetchStatus();
    setTimeout(() => button.style.transform = '', 1000);
});

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(btn => 
            btn.classList.remove('active')
        );
        button.classList.add('active');
        currentFilter = button.dataset.filter;
        filterServers();
    });
});

function filterServers() {
    const servers = document.querySelectorAll('.server-item');
    servers.forEach(server => {
        if (currentFilter === 'all') {
            server.style.display = '';
        } else if (currentFilter === 'active' && server.classList.contains('active')) {
            server.style.display = '';
        } else if (currentFilter === 'inactive' && server.classList.contains('inactive')) {
            server.style.display = '';
        } else {
            server.style.display = 'none';
        }
    });
}

async function fetchStatus() {
    try {
        const response = await fetch("/api/status");
        const data = await response.json();
        updateServerList(data);
        updateChart(data);
        updateStats(data);
    } catch (error) {
        console.error("Error:", error);
    }
}

function updateStats(data) {
    document.getElementById('total-hosts').textContent = data.length;
    document.getElementById('active-hosts').textContent = 
        data.filter(s => s.alive).length;
    const avgResponse = data
        .filter(s => s.time)
        .reduce((acc, s) => acc + s.time, 0) / data.length;
    document.getElementById('avg-response').textContent = 
        `${Math.round(avgResponse)}ms`;
}

// Auto refresh every 30 seconds
setInterval(fetchStatus, 30000);

// Initial load
fetchStatus();