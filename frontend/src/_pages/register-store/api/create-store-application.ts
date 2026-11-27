import {
  createApiClient,
  demoStoreApplications,
  uploadImage,
} from "@/shared/api";
import { getStatusMessage, isDemoMode } from "@/shared/config";
import { CreateStoreInput } from "../model/types";

type CreateStoreApplicationParams = {
  createStoreInput: CreateStoreInput;
};

/**
 * 店舗申請を作成するAPI
 */
export async function createStoreApplication({
  createStoreInput,
}: CreateStoreApplicationParams) {
  if (isDemoMode()) {
    const application = demoStoreApplications[0];
    if (application === undefined) {
      throw new Error("デモ用の店舗申請が見つかりません");
    }

    return {
      data: {
        id: application.id,
        reviewStatus: application.reviewStatus,
        submittedAt: application.submittedAt,
      },
    };
  }

  const { image, ...storeApplication } = createStoreInput;
  const uploadResult = await uploadImage(image);

  if (uploadResult.data === undefined) {
    throw new Error(uploadResult.error);
  }

  const client = await createApiClient();
  const { data, error, response } = await client.POST("/store-applications", {
    body: {
      ...storeApplication,
      imageObjectKey: uploadResult.data.imageObjectKey,
    },
  });

  if (error) {
    throw new Error(getStatusMessage(response.status));
  }

  return { data };
}
