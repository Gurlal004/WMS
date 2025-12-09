import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

type SearchBarProps = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
};

function SearchBar({ search, setSearch }: SearchBarProps) {
  return (
    <TextField
      label="Search Art No"
      variant="outlined"
      fullWidth
      size="small"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      sx={{ mb: 2 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        )
      }}
    />
  );
}

export default SearchBar;