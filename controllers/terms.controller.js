import AuctionTerms from '../schema/Terms.schema.js'
import error from '../helper/res.error.js'
import success from '../helper/res.success.js'


export const createOrUpdateAuctionTerms = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const { content, title = 'Auction Terms & Conditions', updateReason } = req.body;

        // Check if terms already exist
        const existingTerms = await AuctionTerms.findOne({ auction: auctionId });

        let terms;
        
        if (existingTerms) {
            // Parse current version to float before incrementing
            const currentVersion = parseFloat(existingTerms.version.current) || 1.0;
            const newVersion = (currentVersion + 0.1).toFixed(1);
            
            // Update existing terms
            terms = await AuctionTerms.findOneAndUpdate(
                { auction: auctionId },
                {
                    content,
                    title,
                    'version.current': newVersion,
                    status: 'active',
                    _updatedBy: req.user.id,
                    _updateReason: updateReason || 'Content updated',
                    $push: {
                        'version.history': {
                            version: existingTerms.version.current,
                            content: existingTerms.content,
                            updatedAt: new Date(),
                            updatedBy: req.user.id,
                            reason: updateReason || 'Version update'
                        }
                    }
                },
                { new: true, runValidators: true }
            ).populate('version.history.updatedBy', 'name');
            
            return success.successResponse(res, terms, 'Terms updated successfully');
        } else {
            // Create new terms
            terms = await AuctionTerms.create({
                auction: auctionId,
                title,
                content,
                version: {
                    current: '1.0',
                    history: []
                },
                status: 'draft',
                _updatedBy: req.user.id,
                _updateReason: updateReason || 'Initial creation'
            });
            
            return success.successCreatedResponse(res, terms, 'Terms created successfully');
        }

    } catch (err) {
        console.error(err);
        return error.InternalServerError(res, err.message);
    }
};

export const getAuctionTerms = async (req, res) => {
    try {
        const { auctionId } = req.params;

        const terms = await AuctionTerms.findOne({ auction: auctionId })
            .populate('auction', 'title endDate')
            // .populate('version.history.updatedBy', 'name email');

        if (!terms) {
            return error.NOT_FOUND(res, 'No terms found for this auction');
        }

        return success.successResponse(res, terms);

    } catch (err) {
        console.log(err)
        return error.InternalServerError(res, err.message);
    }
};

export const updateAuctionTerms = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const { content, updateReason } = req.body;

        const terms = await AuctionTerms.findOneAndUpdate(
            { auction: auctionId },
            {
                content,
                $inc: { 'version.current': 0.1 },
                status: 'active',
                _updatedBy: req.user.id,
                _updateReason: updateReason || 'Content updated'
            },
            { new: true, runValidators: true }
        ).populate('version.history.updatedBy', 'name');

        if (!terms) {
            return error.NOT_FOUND(res, 'No terms found for this auction');
        }

        return success.successResponse(res, terms, 'Terms updated successfully');

    } catch (err) {
        return error.InternalServerError(res, err.message);
    }
};

export const changeTermsStatus = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const { status, reason } = req.body;

        if (!['draft', 'active', 'archived'].includes(status)) {
            return error.BadRequest(res, 'Invalid status value');
        }

        const terms = await AuctionTerms.findOneAndUpdate(
            { auction: auctionId },
            {
                status,
                _updatedBy: req.user.id,
                _updateReason: reason || `Status changed to ${status}`
            },
            { new: true }
        );

        if (!terms) {
            return error.NOT_FOUND(res, 'No terms found for this auction');
        }

        return success.successResponse(res, terms, 'Terms status updated');

    } catch (err) {
        return error.InternalServerError(res, err.message);
    }
};

export const getTermsHistory = async (req, res) => {
    try {
        const { auctionId } = req.params;

        const terms = await AuctionTerms.findOne({ auction: auctionId })
            .select('version.history')
            .populate('version.history.updatedBy', 'name email');

        if (!terms) {
            return error.NOT_FOUND(res, 'No terms found for this auction');
        }

        return success.successResponse(res, terms.version.history);

    } catch (err) {
        return error.InternalServerError(res, err.message);
    }
};

export const deleteAuctionTerms = async (req, res) => {
    try {
        const { auctionId } = req.params;

        const terms = await AuctionTerms.findOneAndDelete({ auction: auctionId });

        if (!terms) {
            return error.NOT_FOUND(res, 'No terms found for this auction');
        }

        return success.successResponse(res, null, 'Terms deleted successfully');

    } catch (err) {
        return error.InternalServerError(res, err.message);
    }
};