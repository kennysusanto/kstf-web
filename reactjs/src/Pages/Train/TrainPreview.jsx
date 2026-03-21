import { useContext } from "react";
import { useLocation, useNavigate } from "react-router";
import { AuthContext } from "../../context/AuthContext.jsx";
import { getApiUrl } from "../../services/apiUrl.js";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

export default function TrainPreviewPage() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const localImageBinaries = location.state?.localImageBinaries || {};
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
    const cols = isSmallScreen ? 4 : 6;

    const buildImageUrl = (classGroup, file) => {
        const tenantID = user?.tenant_id ?? "";
        const tenantName = user?.tenant_name ?? "";
        const endpoint = `/api/dataset/${tenantID}_${tenantName}/${classGroup.id}_${classGroup.name}/${file.name}`;
        return encodeURI(getApiUrl(endpoint));
    };

    return (
        <Grid container columns={12} spacing={2}>
            <Grid size={12}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                    <Typography variant="h4" component="h2" gutterBottom>
                        Train Dataset Preview
                    </Typography>
                    <Button variant="outlined" onClick={() => navigate("/train")}>Back</Button>
                </Box>
            </Grid>

            {Object.keys(localImageBinaries).length === 0 ? (
                <Grid size={12}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="body1">No image data found. Please go back to Train page and preview dataset again.</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ) : (
                <Grid size={12}>
                    <Card variant="outlined">
                        <CardContent>
                            <ImageList sx={{ maxHeight: "400px"}} cols={cols} rowHeight={140}>
                                {
                                    Object.keys(localImageBinaries).map((classGroupId) => {
                                        const blob = localImageBinaries[classGroupId];
                                        // console.log("Rendering class group", classGroupId, URL.createObjectURL(bmp));
                                        return (
                                            <ImageListItem key={classGroupId}>
                                                <img alt={classGroupId} title={classGroupId} src={URL.createObjectURL(blob)} loading="lazy" />
                                            </ImageListItem>
                                        );
                                })}
                            </ImageList>
                        </CardContent>
                    </Card>
                </Grid>
            )}
        </Grid>
    );
}
