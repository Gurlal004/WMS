import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

function FloatingPlus() {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/addProduct");
    };

    return (
        <Fab onClick={handleClick} color="primary" aria-label="add" style={{ position: 'fixed', bottom: 20, right: 20 }}>
            <AddIcon  />
        </Fab>
    );
}

export default FloatingPlus;
