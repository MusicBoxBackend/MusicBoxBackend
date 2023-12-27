
// Mode 0 is default (show search and add item)
// Mode 1 will show options to cancel an udate

const NavBar = props => {


    //Call filter update in the main page thru the prop function
    function callFilterUpdate(event)
    {
        props.updateFilter(event);
    }


    //Clicked new item!
    function newItem()
    {
        props.newItem();
    }


    //Clicked cancel
    function callCancel()
    {
        props.cancelUpdate();
    }
    function refreshDB()
    {
        props.refreshDB();
    }

    
    switch(props.mode)
    {
        case "0"://Inventory navbar
    {
        return (
        
            <nav className="navbar"
            id="navbar">
    
            <div className="container-fluid">
                <div id = "left-nav">
                    <img src="listicon.png" alt="My Logo" width="30" height="24" className="d-inline-block align-text-top"></img>
                    
                        <p style={{display:'inline-block', verticalAlign: 'center', position: 'relative', top: '3px', fontWeight: '180', fontSize: '20px'}}>Inventory Database</p>

                </div>
            
            <div id = "new">
                <div id = "new1">
                <form className="d-flex" role="search">
                    <input className="form-control me-2" placeholder="Filter" onChange = {callFilterUpdate}></input>
                    
                </form>
                </div>
    
                <div id = "new-item">
                    <button className="btn btn-outline-success" onClick = {newItem}>New Item</button>
                </div>
                <div id = "refresh">
                    <button className="btn btn-outline-success" onClick = {refreshDB}>
                        <img width="20px" alt = "Submit" src = "refresh.png"></img>
                    </button>
                </div>
            </div>
            
            </div>
        </nav>
    
        )
    }

    case "1": //Modify or add item navbar
    {
        return (
        
            <nav className="navbar"
            id="navbar">
    
            <div className="container-fluid">
              <a className="navbar-brand" href="!#">
                <img src="listicon.png" alt="My Logo" width="30" height="24" className="d-inline-block align-text-top"></img>
                Modifying Item
              </a>
              
                <div id = "new2">
                    <button className="btn btn-outline-danger" onClick = {callCancel}>Cancel </button>
                </div>
            
    
                
            
            </div>
        </nav>
    
        )
        }

        default:
            {
            }
    }

    
    
}

export default NavBar;