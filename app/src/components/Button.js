
function Button(props) {
  if (props.disabled) {
    return (
      <button
        className='disabled-btn'
        title={"Game has ended or must make at least one query to be allowed to submit."}
      >
        {props.children}
      </button>
    )
  }

  return (
    <button className="button" onClick={props.onClick}>
      {props.children}
    </button>
  );
}

export default Button;