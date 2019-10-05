import React from 'react';

import { Button, Modal} from 'antd';

import { clipboard } from 'electron';

import CreateForm from './create.form.modal.component';
import Wallet from './logic/wallet.class';
import App from './app';

class SignIn extends React.Component{
    constructor(props){
        super(props);
        this.setState = {
            // Temporary true without validation
            statusFlag: true
        };
    }
    getSignInStatus(){
        return this.setState.statusFlag;
    }
    setSignInStatus(statusFlag){
        this.setState.statusFlag=statusFlag;
    }
    handleCreate() {

        validateFormHashed(this.form).then((values) => {
    
            this.form.resetFields();
            this.setState({ modalOpenCreate: false });
    
            const mnemonic = Wallet.generate();
    
            const wallet = Wallet.create(values.name, mnemonic).encrypt(values.password);
    
            this.__addWallet(wallet, mnemonic);
        });
    
    }
    
    handleReload() {
        this.state.wallets.forEach(w => w.update());
    }
    
    render() {
        // return(<h1>Sign IN Page</h1>);
    
        return (
            <div className="SignIn">
                <Modal visible="true" title="Sign In To Account">
                    <CreateForm
                        ref={form => (this.form = form)}
                        // handleCreate={this.handleCreate} 
                    />
                </Modal>
                <App statusFlag={this.setState.statusFlag} />
                {/* <div style={{ marginBottom: '12px' }}>
                    <Button
                      type="primary"
                      icon="right-square-o"
                    //   onClick={() => this.setState({ modalOpenCreate: true, })}
                    >Sign In
                    </Button>
                    <Button
                      type="primary"
                      icon="plus-circle-o"
                      style={{ marginLeft: '8px' }}
                    //   onClick={() => this.setState({ modalOpenCreate: true, })}
                    >Sign Up
                    </Button>
                </div> */}
                {/* <Modal
                  title="Create a Account"
                //   visible={this.state.modalOpenCreate}
                  okText="Created an Account"
                //   onCancel={this.handleReload}
                //   onOk={this.handleCreate}
                >
                    <CreateForm
                        ref={form => (this.form = form)}
                        // handleCreate={this.handleCreate} 
                    />
                </Modal> */}
            </div>
        );
    }
}

export default SignIn;