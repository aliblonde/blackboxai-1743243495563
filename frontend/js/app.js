// API Configuration
const API_BASE_URL = 'api-proxy.php/api'; // Using XAMPP proxy

// State Management
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Initialize Alpine.js data
document.addEventListener('alpine:init', () => {
  Alpine.data('app', () => ({
    currentTab: 'dashboard',
    showLoginModal: !authToken,
    showSendModal: false,
    showDepositModal: false,
    showExchangeModal: false,
    accounts: [],
    transactions: [],
    sendData: {
      recipientPhone: '',
      amount: '',
      currency: 'IQD',
      note: ''
    },
    depositData: {
      amount: '',
      currency: 'IQD'
    },
    exchangeData: {
      fromCurrency: 'IQD',
      toCurrency: 'USD',
      amount: ''
    },

    // Initialize the app
    init() {
      if (authToken) {
        this.loadDashboardData();
      }
    },

    // Login handler
    async login() {
      try {
        const phone = this.$refs.phoneInput.value;
        const pin = this.$refs.pinInput.value;
        
        const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, pin })
        });

        const data = await response.json();
        
        if (response.ok) {
          authToken = data.token;
          currentUser = data.user;
          localStorage.setItem('authToken', authToken);
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          
          this.showLoginModal = false;
          this.loadDashboardData();
        } else {
          alert(data.error || 'Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login');
      }
    },
    
    // Load dashboard data
    async loadDashboardData() {
      try {
        const [accountsRes, transactionsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/accounts`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          }),
          fetch(`${API_BASE_URL}/transactions`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          })
        ]);

        if (accountsRes.ok) this.accounts = await accountsRes.json();
        if (transactionsRes.ok) this.transactions = await transactionsRes.json();
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    },
    
    // Send money handler
    async sendMoney() {
      try {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            toPhone: this.sendData.recipientPhone,
            amount: parseFloat(this.sendData.amount),
            currency: this.sendData.currency
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          alert('Money sent successfully! Waiting for employee approval.');
          this.showSendModal = false;
          this.resetSendForm();
          this.loadDashboardData();
        } else {
          alert(data.error || 'Failed to send money');
        }
      } catch (error) {
        console.error('Send money error:', error);
        alert('An error occurred while sending money');
      }
    },
    
    // Deposit money handler
    async depositMoney() {
      try {
        const account = this.accounts.find(a => a.currency === this.depositData.currency);
        if (!account) {
          alert('Account not found for selected currency');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/accounts/${account.id}/deposit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            amount: parseFloat(this.depositData.amount)
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          alert('Deposit successful!');
          this.showDepositModal = false;
          this.resetDepositForm();
          this.loadDashboardData();
        } else {
          alert(data.error || 'Failed to deposit money');
        }
      } catch (error) {
        console.error('Deposit error:', error);
        alert('An error occurred during deposit');
      }
    },
    
    // Exchange currency handler
    async exchangeCurrency() {
      try {
        const response = await fetch(`${API_BASE_URL}/accounts/exchange`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            fromCurrency: this.exchangeData.fromCurrency,
            toCurrency: this.exchangeData.toCurrency,
            amount: parseFloat(this.exchangeData.amount)
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          alert('Currency exchanged successfully!');
          this.showExchangeModal = false;
          this.resetExchangeForm();
          this.loadDashboardData();
        } else {
          alert(data.error || 'Failed to exchange currency');
        }
      } catch (error) {
        console.error('Exchange error:', error);
        alert('An error occurred during currency exchange');
      }
    },
    
    // Logout handler
    logout() {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      authToken = null;
      currentUser = null;
      this.showLoginModal = true;
      this.currentTab = 'dashboard';
    },
    
    // Form reset handlers
    resetSendForm() {
      this.sendData = { recipientPhone: '', amount: '', currency: 'IQD', note: '' };
    },
    resetDepositForm() {
      this.depositData = { amount: '', currency: 'IQD' };
    },
    resetExchangeForm() {
      this.exchangeData = { fromCurrency: 'IQD', toCurrency: 'USD', amount: '' };
    },
    
    // Format currency for display
    formatCurrency(amount, currency) {
      return new Intl.NumberFormat(currency === 'IQD' ? 'ar-IQ' : 'en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
      }).format(amount);
    }
  }));
});

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (authToken) {
    Alpine.store('app').loadDashboardData();
  }
});
