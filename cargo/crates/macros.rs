#[macro_export]
macro_rules! respond_ok {
    ($msg:expr, $data:expr) => {
        Ok($crate::lib::respond::ok($msg, $data))
    };
}

#[macro_export]
macro_rules! respond_err {
    ($msg:expr, $code:expr) => {
        Err($crate::error::ApiError::BadRequest($msg.to_string()))
    };
}

#[macro_export]
macro_rules! bail_internal {
    ($expr:expr) => {
        $expr.map_err(|e| $crate::lib::error::ApiError::Internal(e.to_string()))?
    };
    ($expr:expr, $msg:expr) => {
        $expr.map_err(|_| $crate::lib::error::ApiError::Internal($msg.to_string()))?
    };
}
