import { Container } from "@mui/material";

interface AdminContainerProps {
  children: React.ReactNode;
}

const AdminContainer = ({ children }: AdminContainerProps) => {
  return (
    <Container
      maxWidth="md"
      sx={{
        marginTop: "20px",
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#000000",
        borderRadius: "10px",
        boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
        color: "white",
      }}
    >
      {children}
    </Container>
  );
};

export default AdminContainer;
