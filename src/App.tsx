import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Wallet from "./pages/Wallet";
import UserWallet from "./pages/UserWallet";
import ServicePackage from "./pages/ServicePackage";
import MiningPackage from "./pages/MiningPackage";
import DirectTeam from "./pages/DirectTeam";
import AllTeam from "./pages/AllTeam";
import BusinessHistory from "./pages/BusinessHistory";
import ServiceGenerationIncome from "./pages/ServiceGenerationIncome";
import MatchingIncome from "./pages/MatchingIncome";
import ClubIncome from "./pages/ClubIncome";
import RewardIncome from "./pages/RewardIncome";
import FastTrackBonus from "./pages/FastTrackBonus";
import MiningGenerationIncome from "./pages/MiningGenerationIncome";
import MiningProfitSharing from "./pages/MiningProfitSharing";
import NodeBusinessSharing from "./pages/NodeBusinessSharing";
import DepositFund from "./pages/DepositFund";
import DepositConfirmation from "./pages/DepositConfirmation";
import TransferToNodeWallet from "./pages/TransferToNodeWallet";
import TransferToCapitalWallet from "./pages/TransferToCapitalWallet";
import TransferFundReport from "./pages/TransferFundReport";
import ReceiveFundReport from "./pages/ReceiveFundReport";
import DepositInvoice from "./pages/DepositInvoice";
import RankAndReward from "./pages/RankAndReward";
import WalletAddress from "./pages/WalletAddress";
import WithdrawReport from "./pages/WithdrawReport";
import WithdrawFund from "./pages/WithdrawFund";
import IncomeSummary from "./pages/IncomeSummary";
import AccountStatement from "./pages/AccountStatement";
import Support from "./pages/Support";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import ConditionalHome from "./components/auth/ConditionalHome";
import ManageRankReward from "./pages/Admin/ManageRankReward";
import ManageIncomeType from "./pages/Admin/ManageIncomeType";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminDeposits from "./pages/Admin/AdminDeposits";
import AdminWalletTransactions from "./pages/Admin/AdminWalletTransactions";
import AuthTest from "./pages/AuthTest";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Redirect root to sign-in */}
          <Route path="/" element={<Navigate to="/StyloCoin/signin" replace />} />
          
          {/* Auth Layout */}
          <Route path="/StyloCoin/signin" element={<SignIn />} />
          <Route path="/StyloCoin/signup" element={<SignUp />} />

          {/* Protected Dashboard Layout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/StyloCoin/" element={<AppLayout />}>
              <Route index element={<ConditionalHome />} />
              <Route path="dashboard" element={<Home />} />

            {/* Others Page */}
            <Route path="profile" element={<UserProfiles />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="user-wallet" element={<UserWallet />} />
            <Route path="service-package" element={<ServicePackage />} />
            <Route path="mining-package" element={<MiningPackage />} />
            <Route path="directTeam" element={<DirectTeam />} />
            <Route path="allTeam" element={<AllTeam />} />
            <Route path="businessHistory" element={<BusinessHistory />} />
            <Route path="serviceGeneration" element={<ServiceGenerationIncome />} />
            <Route path="matchingIncome" element={<MatchingIncome />} />
            <Route path="clubIncome" element={<ClubIncome />} />
            <Route path="rewardIncome" element={<RewardIncome />} />
            <Route path="fastTrackBonus" element={<FastTrackBonus />} />
            <Route path="miningProfitSharing" element={<MiningProfitSharing />} />
            <Route path="miningGeneration" element={<MiningGenerationIncome />} />
            <Route path="nodeBusinessSharing" element={<NodeBusinessSharing />} />
            <Route path="depositFund" element={<DepositFund />} />
            <Route path="depositConfirmation" element={<DepositConfirmation />} />
            <Route path="depositInvoice" element={<DepositInvoice />} />
            <Route path="rankAndReward" element={<RankAndReward />} />
            <Route path="walletAddress" element={<WalletAddress />} />
            <Route path="transferToNodeWallet" element={<TransferToNodeWallet />} />
            <Route path="transferToCapitalWallet" element={<TransferToCapitalWallet />} />
            <Route path="transferReport" element={<TransferFundReport />} />
            <Route path="receiveReport" element={<ReceiveFundReport />} />
            <Route path="withdrawReport" element={<WithdrawReport />} />
            <Route path="withdrawFund" element={<WithdrawFund />} />
            <Route path="incomeSummary" element={<IncomeSummary />} />
            <Route path="accountStatement" element={<AccountStatement />} />
            <Route path="auth-test" element={<AuthTest />} />
            <Route path="support" element={<Support />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="blank" element={<Blank />} />

            {/* Forms */}
            <Route path="form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="alerts" element={<Alerts />} />
            <Route path="avatars" element={<Avatars />} />
            <Route path="badge" element={<Badges />} />
            <Route path="buttons" element={<Buttons />} />
            <Route path="images" element={<Images />} />
            <Route path="videos" element={<Videos />} />

            {/* Charts */}
            <Route path="line-chart" element={<LineChart />} />
            <Route path="bar-chart" element={<BarChart />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/StyloCoin/admin" element={<AppLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="ranks" element={<ManageRankReward />} />
              <Route path="income-types" element={<ManageIncomeType />} />
              <Route path="deposits" element={<AdminDeposits />} />
              <Route path="wallet-transactions" element={<AdminWalletTransactions />} />
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
