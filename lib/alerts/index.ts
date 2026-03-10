import Swal from "sweetalert2";

export const AlertDialog = ({
  titleMessage,
  titleDialog,
  textMessage,
  textDialog,
  showCancel,
  confirmButton,
}: any) => {
  return Swal.fire({
    title: titleDialog,
    text: textDialog,
    icon: "warning",
    showCancelButton: showCancel,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: confirmButton,
  });
};
