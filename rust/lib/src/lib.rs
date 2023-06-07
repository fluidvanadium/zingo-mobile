#[macro_use]
extern crate lazy_static;

use std::cell::RefCell;
use std::sync::{Arc, Mutex};

use base64::{decode, encode};

use zingoconfig::construct_lightwalletd_uri;
use zingolib::wallet::WalletBase;
use zingolib::{commands, lightclient::LightClient};

// We'll use a MUTEX to store a global lightclient instance,
// so we don't have to keep creating it. We need to store it here, in rust
// because we can't return such a complex structure back to JS
lazy_static! {
    static ref LIGHTCLIENT: Mutex<RefCell<Option<Arc<LightClient>>>> =
        Mutex::new(RefCell::new(None));
}

fn lock_client_return_seed(lightclient: LightClient) -> String {
    let lc = Arc::new(lightclient);
    LightClient::start_mempool_monitor(lc.clone());

    LIGHTCLIENT.lock().unwrap().replace(Some(lc));

    let seed = match LIGHTCLIENT
        .lock()
        .unwrap()
        .borrow()
        .as_ref()
        .unwrap()
        .do_seed_phrase_sync()
    {
        Ok(s) => s.dump(),
        Err(e) => {
            return format!("Error: {}", e);
        }
    };

    seed
}
fn construct_uri_load_config(
    uri: String,
    data_dir: String,
    chain_hint: &str,
) -> Result<(zingoconfig::ZingoConfig, http::Uri), String> {
    let lightwalletd_uri = construct_lightwalletd_uri(Some(uri));

    use zingoconfig::ChainType::*;
    let chaintype = match chain_hint {
        "main" => Mainnet,
        "test" => Testnet,
        "regtest" => Regtest,
        _ => return Err("Not a valid chain hint!".to_string()),
    };
    let mut config = match zingolib::load_clientconfig(lightwalletd_uri.clone(), None, chaintype) {
        Ok(c) => c,
        Err(e) => {
            return Err(format!("Error: Config load: {}", e));
        }
    };

    config.set_data_dir(data_dir);
    Ok((config, lightwalletd_uri))
}
pub fn init_new(server_uri: String, data_dir: String, chain_hint: &str) -> String {
    let (config, lightwalletd_uri);
    match construct_uri_load_config(server_uri, data_dir, chain_hint) {
        Ok((c, h)) => (config, lightwalletd_uri) = (c, h),
        Err(s) => return s,
    }
    let latest_block_height = match zingolib::get_latest_block_height(lightwalletd_uri)
        .map_err(|e| format! {"Error: {e}"})
    {
        Ok(height) => height,
        Err(e) => return e,
    };
    let lightclient = match LightClient::new(&config, latest_block_height.saturating_sub(100)) {
        Ok(l) => l,
        Err(e) => {
            return format!("Error: {}", e);
        }
    };
    lock_client_return_seed(lightclient)
}

pub fn init_from_seed(
    server_uri: String,
    seed: String,
    birthday: u64,
    data_dir: String,
    chain_hint: &str,
) -> String {
    let (config, _lightwalletd_uri);
    match construct_uri_load_config(server_uri, data_dir, chain_hint) {
        Ok((c, h)) => (config, _lightwalletd_uri) = (c, h),
        Err(s) => return s,
    }
    let lightclient = match LightClient::new_from_wallet_base(
        WalletBase::MnemonicPhrase(seed),
        &config,
        birthday,
        false,
    ) {
        Ok(l) => l,
        Err(e) => {
            return format!("Error: {}", e);
        }
    };
    lock_client_return_seed(lightclient)
}

pub fn init_from_ufvk(
    server_uri: String,
    ufvk: String,
    birthday: u64,
    data_dir: String,
    chain_hint: &str,
) -> String {
    let (config, _lightwalletd_uri);
    match construct_uri_load_config(server_uri, data_dir, chain_hint) {
        Ok((c, h)) => (config, _lightwalletd_uri) = (c, h),
        Err(s) => return s,
    }
    let lightclient =
        match LightClient::new_from_wallet_base(WalletBase::Ufvk(ufvk), &config, birthday, false) {
            Ok(l) => l,
            Err(e) => {
                return format!("Error: {}", e);
            }
        };
    lock_client_return_seed(lightclient)
}

pub fn init_from_b64(
    server_uri: String,
    base64_data: String,
    data_dir: String,
    chain_hint: &str,
) -> String {
    let (config, _lightwalletd_uri);
    match construct_uri_load_config(server_uri, data_dir, chain_hint) {
        Ok((c, h)) => (config, _lightwalletd_uri) = (c, h),
        Err(s) => return s,
    }
    let decoded_bytes = match decode(&base64_data) {
        Ok(b) => b,
        Err(e) => {
            return format!("Error: Decoding Base64: {}", e);
        }
    };

    let lightclient = match LightClient::read_wallet_from_buffer(&config, &decoded_bytes[..]) {
        Ok(l) => l,
        Err(e) => {
            return format!("Error: {}", e);
        }
    };
    lock_client_return_seed(lightclient)
}

pub fn save_to_b64() -> String {
    // Return the wallet as a base64 encoded string
    let lightclient: Arc<LightClient>;
    {
        let lc = LIGHTCLIENT.lock().unwrap();

        if lc.borrow().is_none() {
            return format!("Error: Light Client is not initialized");
        }

        lightclient = lc.borrow().as_ref().unwrap().clone();
    };

    match lightclient.do_save_to_buffer_sync() {
        Ok(buf) => encode(&buf),
        Err(e) => {
            format!("Error: {}", e)
        }
    }
}

pub fn execute(cmd: String, args_list: String) -> String {
    let resp: String;
    {
        let lightclient: Arc<LightClient>;
        {
            let lc = LIGHTCLIENT.lock().unwrap();

            if lc.borrow().is_none() {
                return format!("Error: Light Client is not initialized");
            }

            lightclient = lc.borrow().as_ref().unwrap().clone();
        };

        let args = if args_list.is_empty() {
            vec![]
        } else {
            vec![args_list.as_ref()]
        };
        resp = commands::do_user_command(&cmd, &args, lightclient.as_ref()).clone();
    };

    resp
}

pub fn get_latest_block(server_uri: String) -> String {
    let lightwalletd_uri: http::Uri = server_uri.parse().expect("To be able to represent a Uri.");
    match zingolib::get_latest_block_height(lightwalletd_uri).map_err(|e| format! {"Error: {e}"}) {
        Ok(height) => height.to_string(),
        Err(e) => e,
    }
}
