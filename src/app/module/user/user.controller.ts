// import { Request, Response, NextFunction } from "express";
// import catchAsync from "../../../shared/catchAsync";
// import { sendResposne } from "../../../shared/sendResponse";
// import status from "http-status";

// const getAllUsers = catchAsync(async (req: Request, res: Response) => {
//     const filters: IUserFilterRequest = {
//         role: req.query.role as any,
//         status: req.query.status as any,
//         searchTerm: req.query.searchTerm as string,
//         page: req.query.page ? Number(req.query.page) : 1,
//         limit: req.query.limit ? Number(req.query.limit) : 10,
//     };

//     const result = await UserService.getAllUsers(filters);

//     sendResposne(res, {
//         httpStatusCode: status.OK,
//         success: true,
//         message: "Users fetched successfully",
//         data: result.data,
//         // @ts-ignore
//         meta: result.meta,
//     });
// });


// const getUserById = catchAsync(async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const result = await UserService.getUserById(id);

//     sendResposne(res, {
//         httpStatusCode: status.OK,
//         success: true,
//         message: "User fetched successfully",
//         data: result,
//     });
// });

// const updateUserRole = catchAsync(async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const result = await UserService.updateUserRole(id, req.body);

//     sendResposne(res, {
//         httpStatusCode: status.OK,
//         success: true,
//         message: "User role updated successfully",
//         data: result,
//     });
// });

// const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const result = await UserService.updateUserStatus(id, req.body);

//     sendResposne(res, {
//         httpStatusCode: status.OK,
//         success: true,
//         message: "User status updated successfully",
//         data: result,
//     });
// });




// const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
//     const userId = req.user?.userId as string;
//     const result = await UserService.updateMyProfile(userId, req.body);

//     sendResposne(res, {
//         httpStatusCode: status.OK,
//         success: true,
//         message: "Profile updated successfully",
//         data: result,
//     });
// });

// export const UserController = {
//     getAllUsers,
//     getUserById,
//     updateUserRole,
//     updateUserStatus,
//     getMyProfile,
//     updateMyProfile,
// };