import React from 'react';
import { Tabs, Icon, Layout } from 'antd';
import WalletsContent from './wallets.content.component';
import SignIn from './signin.component';
import HomePage from './homepage.component';
import StatsContent from './stats.content.component';
import TransactionsContent from './payments.content.component.jsx';

const { Header, Footer, Content } = Layout;

class App extends React.Component {


    render() {
        return (
            <Layout>
                <Header className="Header">
                    {/* <img style={{ marginTop: '10px', height: '40px', width: 'auto', float: 'left', marginRight: '18px' }}
                            src="./images/planet.png"
                            alt="Bitcoin Logo" />

                    <h3>CO2 Wallet</h3> */}
                    <Tabs defaultActiveKey="1" style={{ padding: '16px' }}>
                        <Tabs.TabPane tab={<span>CO2 Wallet</span>} key="1" />
                        <Tabs.TabPane  tab={<span><Icon type="login" />Sign In</span>} key="2">
                            {/* <SignIn /> */}
                        </Tabs.TabPane>
                        <Tabs.TabPane tab={<span><Icon type="plus-circle-o" />Create Account</span>} key="3">
                            {/* <SignUp /> */}
                        </Tabs.TabPane>
                    </Tabs>
                </Header>
                <Content>
                    <div className="App">
                        <HomePage />
                        {this.props.statusFlag?
                        <Tabs defaultActiveKey="1" style={{ padding: '16px' }}>
                            <Tabs.TabPane tab={<span><Icon type="wallet" />Wallet Details</span>} key="1">
                                <WalletsContent />
                            </Tabs.TabPane>
                            <Tabs.TabPane tab={<span><Icon type="calendar" />Transaction History</span>} key="2">
                                <StatsContent />
                                <TransactionsContent />
                            </Tabs.TabPane>
                        </Tabs>: <HomePage />}
                    </div>
                </Content>

                <Footer>
                    Developed By Ctrl+Alt+Elite
                </Footer>
            </Layout>

        );
    }
}

export default App;
